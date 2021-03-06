import json
from typing import Any, Dict, List

from flask import Blueprint, request
from flask_login import login_required, current_user
from werkzeug import ImmutableMultiDict

import config
from record_service.database.database import db
from record_service.external import acl_api, queueing_api
from record_service.models.record import Record
from record_service.models.record_key import RecordKey
from record_service.models.user import User
from record_service.models.notification import Notification, NotificationType

from record_service.utils.responses import JsonResponse
from record_service.utils.file_uploader import FileUploader, IpfsWriter
from record_service.utils.permissions import (
    parse_uploaded_permissions,
    create_acl_permissions,
    set_permissions,
)


record_api = Blueprint("record_api", __name__)
UPLOADER = FileUploader(IpfsWriter())


# Data object:
# [
#     {
#         id: string,
#         name: string,
#         hash: string,
#         created: string (iso format ts),
#         permissioned_users: [{id, email}]
#     }
# ]
@record_api.route("/records", methods=["GET"])
@login_required
def get_all_records_for_user() -> JsonResponse:
    """Lists all the records the current user owns or has access to."""

    # Query ACL to get list of files user has access to
    acl_client = acl_api.build_client(config.ACL_URL, config.ACL_PORT)
    permissioned_records = acl_api.get_records_for_user(
        acl_client, str(current_user.get_id())
    )

    records = (
        db.session.query(Record)
        .filter(Record.id.in_(permissioned_records.keys()))
        .all()
    )

    if records is None:
        # no records for user
        return JsonResponse(message="No records found.", data=[], status=204)

    data = [
        {
            "id": str(r.id),
            "name": r.filename,
            "hash": r.record_hash,
            "created": r.created.isoformat(),
        }
        for r in records
    ]

    # Not the most performant but we're dealing with O(10) entries right now
    for d in data:
        permissioned_user_ids = [
            u[0] for u in acl_api.get_users_for_record(acl_client, d["id"])
        ]
        d["permissioned_users"] = [
            {"id": str(u.id), "email": u.email}
            for u in db.session.query(User)
            .filter(User.id.in_(permissioned_user_ids))
            .all()
        ]

    return JsonResponse(data=data, status=200)


@record_api.route("/records/<string:record_id>", methods=["GET"])
@login_required
def get_record_for_user(record_id: str) -> JsonResponse:
    """Get the metadata of the file at record_id."""
    record = db.session.query(Record).get(record_id)
    if record is None:
        return JsonResponse(
            message=f"No record with record_id={record_id} found.", status=204
        )

    # Query acl to check if user has read access to file
    acl_client = acl_api.build_client(config.ACL_URL, config.ACL_PORT)
    if not acl_api.is_user_permissioned_for_read(
        acl_client, str(current_user.get_id()), record_id
    ):
        return JsonResponse(message="Access denied.", status=401)

    return JsonResponse(
        data=record.to_dict(uuid_as_str=True, datetime_as_str=True), status=200
    )


def _validate_form_request(
    form: ImmutableMultiDict, permissions_json: List[Dict[str, Any]]
):
    if permissions_json is None:
        return False, "Invalid JSON was passed for permissions"
    if {"permissions", "filename"} - set(form.keys()):
        return False, "Missing top level data"

    # Check if no permissions were specified
    if not permissions_json:
        return True, ""
    entry = permissions_json[0]
    missing_fields = {"email", "values"} - entry.keys() or {
        "permission",
        "encryptedAesKey",
        "iv",
    } - entry["values"].keys()
    return not missing_fields, "Missing data in permissions"


@record_api.route("/records", methods=["POST"])
@login_required
def upload_file():
    """Upload file to distributed file store.

    Expects client to pass the following:
    - file: encrypted record, set by multipart
    - data:
      - filename: Original name of the file
      - permissions: [
          {
              email: email of user being granted permission
              values: {
                  permission: permission to be granted (read, write)
                  encryptedAesKey: File's encryption key, encrypted with user's pub key
                  iv: IV used in AES (this doesn't need to be encrypted)
              }
          }
      ]
    """
    if "file" not in request.files:
        return "No file.", 400

    data = request.form
    permissions_json = [json.loads(x) for x in data.getlist("permissions")][0]

    valid, msg = _validate_form_request(data, permissions_json)
    if not valid:
        return msg, 400

    perms_with_uuid = parse_uploaded_permissions(permissions_json, db)

    # Upload the file to IPFS
    new_record = UPLOADER.upload(request.files["file"], data["filename"])
    new_record.creator_id = current_user.get_id()

    # Update permissions in the ACL service
    create_acl_permissions(current_user.get_id(), str(new_record.id), perms_with_uuid)

    # Add record first so we can reference it as a foreign key
    db.session.add(new_record)
    db.session.commit()

    current_user_email = db.session.query(User).get(current_user.get_id()).email

    # Store keys locally then push them out to message service
    for user_uuid, values in perms_with_uuid.items():
        db.session.add(
            RecordKey(
                record_id=new_record.id,
                user_id=user_uuid,
                encrypted_key=values["encryptedAesKey"],
                iv=values["iv"],
            )
        )

        if user_uuid == current_user.get_id():
            continue

        email = db.session.query(User).get(user_uuid).email

        notification = Notification(
            content=dict(
                email=email,
                filename=data["filename"],
                recordId=str(new_record.id),
                senderEmail=current_user_email,
            ),
            notification_type=NotificationType.CREATE,
            sender=current_user.get_id(),
            user_id=user_uuid,
        )
        db.session.add(notification)
        queueing_api.send_message(user_uuid, notification.to_json())
    db.session.commit()

    return str(new_record.id), 200


@record_api.route("/records/update/<string:record_id>", methods=["POST"])
@login_required
def update_record(record_id: str) -> JsonResponse:
    """Upload file to distributed file store.

    Expects client to pass the following:
    - file: encrypted record, set by multipart
    - data:
      - filename: Original name of the file
      - permissions: [
          {
              email: email of user being granted permission
              values: {
                  permission: permission to be granted (read, write)
                  encryptedAesKey: File's encryption key, encrypted with user's pub key
                  iv: IV used in AES (this doesn't need to be encrypted)
              }
          }
      ]
    """
    if "file" not in request.files:
        return "No file.", 400

    data = request.form
    permissions_json = [json.loads(x) for x in data.getlist("permissions")][0]

    valid, msg = _validate_form_request(data, permissions_json)
    if not valid:
        return msg, 400

    perms_with_uuid = parse_uploaded_permissions(permissions_json, db)

    # Upload the file to IPFS
    new_record = UPLOADER.update(request.files["file"], data["filename"], record_id)

    # Update permissions in the ACL service
    set_permissions(current_user.get_id(), record_id, perms_with_uuid)

    # Update record
    db.session.query(Record).filter(Record.id == record_id).update(new_record)
    db.session.commit()

    current_user_email = db.session.query(User).get(current_user.get_id()).email

    # Delete all old keys associated with the record
    db.session.query(RecordKey).filter(RecordKey.record_id == record_id).delete()

    # Store keys locally then push them out to message service
    for user_uuid, values in perms_with_uuid.items():
        db.session.add(
            RecordKey(
                record_id=record_id,
                user_id=user_uuid,
                encrypted_key=values["encryptedAesKey"],
                iv=values["iv"],
            )
        )

        if user_uuid == current_user.get_id():
            continue

        email = db.session.query(User).get(user_uuid).email

        notification = Notification(
            content=dict(
                email=email,
                filename=data["filename"],
                recordId=str(record_id),
                senderEmail=current_user_email,
            ),
            notification_type=NotificationType.UPDATE,
            sender=current_user.get_id(),
            user_id=user_uuid,
        )
        db.session.add(notification)
        queueing_api.send_message(user_uuid, notification.to_json())
    db.session.commit()

    return "Update successful!", 200


@record_api.route("/records/<string:record_id>", methods=["DELETE"])
@login_required
def delete_record(record_id: str) -> JsonResponse:
    # Query acl to check if user has write access to file
    acl_client = acl_api.build_client(config.ACL_URL, config.ACL_PORT)
    if not acl_api.is_user_permissioned_for_write(
        acl_client, str(current_user.get_id()), record_id
    ):
        return JsonResponse(message="Access denied.", status=401)

    # Delete records and keys associated with the id
    # Note that we need to delete from RecordKey first so we don't violate
    # foreign key constraints
    db.session.query(RecordKey).filter(RecordKey.record_id == record_id).delete()
    db.session.query(Record).filter(Record.id == record_id).delete()
    db.session.commit()

    # Delete acl records associated with the id
    acl_api.set_permissions(acl_client, current_user.get_id(), record_id, {})

    return JsonResponse(message="Deletion successful!", status=200)

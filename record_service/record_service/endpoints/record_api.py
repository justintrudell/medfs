import json
import os
from typing import Any, Dict, List

from flask import Blueprint, request
from flask_login import login_required, current_user
from werkzeug import secure_filename, ImmutableMultiDict

import config
from record_service.database.database import db
from record_service.external import acl_api, queueing_api
from record_service.models.record import Record
from record_service.models.user import User
from record_service.utils.exceptions import (
    PermissionModificationError,
    UserNotFoundError,
)
from record_service.utils.responses import JsonResponse
from record_service.utils.file_uploader import FileUploader, IpfsWriter


record_api = Blueprint("record_api", __name__)
UPLOADER = FileUploader(IpfsWriter())
PermissionsDict = Dict[str, Dict[str, str]]
UploadRequest = List[PermissionsDict]


# Data object:
# [
#     {
#         id: string,
#         name: string,
#         hash: string,
#         created: string (iso format ts)
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
        } for r in records
    ]

    data = [d for d in data if d["id"] in permissioned_records]

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
    if {"extension", "permissions", "filename"} - set(form.keys()):
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
      - extension: file extension (i.e. .pdf files = "pdf")
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

    perms_with_uuid = _parse_permissions(permissions_json)
    file_path = _save_uploaded_file(request.files["file"])

    # Upload the file to IPFS
    new_record = UPLOADER.upload(
        data["filename"], file_path, data["extension"])
    new_record.creator_id = current_user.get_id()

    # Update permissions in the ACL service
    _create_acl_permissions(str(new_record.id), perms_with_uuid)

    # Push out keys to message service
    for user_uuid, values in perms_with_uuid.items():
        msg = json.dumps(
            {
                "type": "privateKey",
                "recordId": str(new_record.id),
                "encryptedAesKey": values["encryptedAesKey"],
                "iv": values["iv"],
            }
        )
        queueing_api.send_message(user_uuid, msg)

    db.session.add(new_record)
    db.session.commit()

    return str(new_record.id), 200


def _parse_permissions(permissions_json: UploadRequest) -> PermissionsDict:
    permissions_dict = {dct["email"]: dct["values"]
                        for dct in permissions_json}
    perms_with_uuid = {}
    for email, values in permissions_dict.items():
        user_obj = db.session.query(User).filter_by(email=email).one_or_none()
        if user_obj is None:
            raise UserNotFoundError(f"User {email} did not exist")
        perms_with_uuid[str(user_obj.id)] = values
    return perms_with_uuid


def _save_uploaded_file(flask_file) -> str:
    if not flask_file.filename:
        raise ValueError("No filename on uploaded file")
    # TODO: add header data to file
    filename = secure_filename(flask_file.filename)
    path = os.path.join("/tmp", filename)
    flask_file.save(path)
    return path


def _create_acl_permissions(record_uuid: str, permissions_dict: PermissionsDict):
    acl_client = acl_api.build_client(config.ACL_URL, config.ACL_PORT)
    user_id = current_user.get_id()
    ret = acl_api.add_record(acl_client, user_id, record_uuid)
    if not ret.result:
        raise PermissionModificationError("Failed to add record")

    permissions = {key: dct["permission"]
                   for key, dct in permissions_dict.items()}
    # Since _create_acl_permissions needs a "state of the world",
    # we have to add ourselves to this state of the world
    permissions[user_id] = "WRITE"
    ret = acl_api.set_permissions(
        acl_client, current_user.get_id(), record_uuid, permissions
    )
    if not ret.result:
        raise PermissionModificationError(
            "Failed to modify permissions on record")

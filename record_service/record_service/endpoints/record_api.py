from flask import Blueprint, request
from flask_login import login_required, current_user
import json
import os
from typing import Dict
from werkzeug import secure_filename

import config
from record_service.database.database import db
from record_service.external import acl_api, queueing_api
from record_service.models.record import Record
from record_service.models.user import User
from record_service.utils import crypto
from record_service.utils.exceptions import PermissionModificationException
from record_service.utils.responses import JsonResponse
from record_service.utils.file_uploader import FileUploader, IpfsWriter


record_api = Blueprint("record_api", __name__)
UPLOADER = FileUploader(IpfsWriter())


@record_api.route("/records", methods=["GET"])
@login_required
def get_all_records_for_user() -> JsonResponse:
    """Lists all the records the current user owns or has access to."""

    # Query ACL to get list of files user has access to
    acl_client = acl_api.build_client(config.ACL_URL, config.ACL_PORT)
    permissioned_records = acl_api.get_records_for_user(
        acl_client,
        str(current_user.get_id())
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
        {"id": str(r.id), "name": r.filename, "hash": r.record_hash} for r in records
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
        acl_client,
        str(current_user.get_id()),
        record_id
    ):
        return JsonResponse(message="Access denied.", status=401)

    return JsonResponse(
        data=record.to_dict(uuid_as_str=True, datetime_as_str=True), status=200
    )


@record_api.route("/records", methods=["POST"])
@login_required
def upload_file():
    """Upload file to distributed file store.

    Expects client to pass the following:
    - file: set by multipart
    - data:
      - extension: file extension (i.e. .pdf files = "pdf")
      - permissions: JSON mapping users (denoted by email) to the permissions they'll
                     be granted ('read' or 'write')
    """
    if "file" not in request.files:
        return "No file.", 400

    data = request.form
    if not all(key in data.keys() for key in ("extension", "permissions")):
        return "Missing data", 400

    permissions_json = json.loads(data["permissions"])
    if permissions_json is None:
        return "Invalid JSON was passed for permissions", 400
    permissions_dict = {dct["email"]: dct["value"] for dct in permissions_json}
    perms_with_uuid = {
        str(db.session.query(User).filter_by(email=email).one().id): value
        for email, value in permissions_dict.items()
    }
    # Since _create_acl_permissions needs a "state of the world",
    # we have to add ourselves to this state of the world
    perms_with_uuid[str(current_user.get_id())] = "WRITE"
    flask_filename = request.files["file"].filename
    file_path = _save_uploaded_file(request.files["file"])
    encrypted_file_data, private_key = crypto.encrypt_file(file_path)

    # Upload the file to IPFS
    new_record = UPLOADER.upload_bytes(
        flask_filename, encrypted_file_data, data["extension"]
    )
    new_record.creator_id = current_user.get_id()

    # Update permissions in the ACL service
    _create_acl_permissions(str(new_record.id), perms_with_uuid)

    # Push out keys to message service
    msg = json.dumps(
        {
            "type": "privateKey",
            "recordId": str(new_record.id),
            "privateKey": private_key.decode(),
        }
    )
    for user_uuid in perms_with_uuid.keys() | {current_user.get_id()}:
        queueing_api.send_message(user_uuid, msg)

    db.session.add(new_record)
    db.session.commit()

    return str(new_record.id), 200


def _save_uploaded_file(flask_file) -> str:
    if not flask_file.filename:
        raise ValueError("No filename")
    # TODO: add header data to file
    filename = secure_filename(flask_file.filename)
    path = os.path.join("/tmp", filename)
    flask_file.save(path)
    return path


def _create_acl_permissions(record_uuid: str, permissions: Dict[str, str]):
    acl_client = acl_api.build_client(config.ACL_URL, config.ACL_PORT)
    ret = acl_api.add_record(acl_client, current_user.get_id(), record_uuid)
    if not ret.result:
        raise PermissionModificationException("Failed to add record")
    ret = acl_api.set_permissions(
        acl_client, current_user.get_id(), record_uuid, permissions
    )
    if not ret.result:
        raise PermissionModificationException("Failed to modify permissions on record")

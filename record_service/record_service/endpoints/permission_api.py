import json

from flask import Blueprint, request
from flask_login import login_required, current_user
from typing import Tuple

import config
from record_service.external import acl_api, queueing_api
from record_service.models.record import Record
from record_service.models.record_key import RecordKey
from record_service.models.notification import Notification, NotificationType
from record_service.models.user import User
from record_service.database.database import db
from record_service.utils.permissions import parse_uploaded_permissions, set_permissions
from record_service.utils.responses import JsonResponse

permission_api = Blueprint("permission_api", __name__, url_prefix="/permissions")


@permission_api.route("/<string:record_id>", methods=["POST"])
@login_required
def update_permissions(record_id: str) -> Tuple[str, int]:
    """
    JSON is expected in the format:
    {
        "data": {
            "permissions": [
                {
                    email: email of user being granted permission
                    values: {
                        permission: permission to be granted (read, write)
                        encryptedAesKey: Encrypted file encryption key
                        iv: IV used in AES (this doesn't need to be encrypted)
                    }
                }
            ]
        }
    }
    """
    req_json = request.get_json(silent=True)
    if req_json is None:
        return "Invalid JSON was passed", 400
    record = db.session.query(Record).get(record_id)
    if record is None:
        return "Record did not exist", 400

    acl_client = acl_api.build_client(config.ACL_URL, config.ACL_PORT)
    if not acl_api.is_user_permissioned_for_write(
        acl_client, str(current_user.get_id()), record_id
    ):
        return JsonResponse(
            message="User not authorized to change permissions.", status=401
        )

    perms_with_uuids = parse_uploaded_permissions(req_json["permissions"], db)
    for user_uuid, values in perms_with_uuids.items():
        item = db.session.query(RecordKey).get((record.id, user_uuid))
        user = db.session.query(User).get(user_uuid)

        # Store keys if we haven't done that yet
        if item is None:
            db.session.add(
                RecordKey(
                    record_id=record.id,
                    user_id=user.id,
                    encrypted_key=values["encryptedAesKey"],
                    iv=values["iv"],
                )
            )
            notification_type = NotificationType.CREATE
        else:
            notification_type = NotificationType.UPDATE

        msg = json.dumps(
            {
                "type": "privateKey",
                "email": user.email,
                "recordId": record_id,
                "encryptedAesKey": values["encryptedAesKey"],
                "iv": values["iv"],
                "filename": record.filename,
            }
        )
        db.session.add(
            Notification(
                user_id=user.id,
                notification_type=notification_type,
                sender=current_user.get_id(),
                content=json.dumps(
                    {
                        "email": user.email,
                        "recordId": record_id,
                        "filename": record.filename,
                    }
                ),
            )
        )
        queueing_api.send_message(user.id, msg)

    db.session.commit()
    set_permissions(current_user.get_id(), record_id, perms_with_uuids, acl_client)
    return "Success", 200


@permission_api.route("/<string:record_id>", methods=["GET"])
@login_required
def get_permissions(record_id: str):
    record = db.session.query(Record).get(record_id)
    if record is None:
        return JsonResponse(
            message=f"No record with record_id={record_id} found.", status=404
        )

    acl_client = acl_api.build_client(config.ACL_URL, config.ACL_PORT)

    if not acl_api.is_user_permissioned_for_write(
        acl_client, str(current_user.get_id()), str(record_id)
    ):
        return JsonResponse(
            message=f"User not allowed to view permissions.", status=401
        )

    permissions = acl_api.get_users_for_record(acl_client, str(record_id))

    data = list()
    for user_id, permission in permissions:
        if user_id == current_user.get_id():
            # remove self from list
            continue
        user = db.session.query(User).get(user_id)
        data.append({"userEmail": user.email, "permissionType": permission})

    return JsonResponse(data=data, status=200)

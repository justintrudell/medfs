from flask import Blueprint, request
from flask_login import login_required, current_user
from typing import Tuple

import config
from record_service.external import acl_api, queueing_api
from record_service.models.record import Record
from record_service.models.user import User
from record_service.database.database import db
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
                    "email": email of user being granted permission,
                    "values": {
                        "permission": permission to be granted (read, write),
                        "encryptedAesKey": File's encryption key, encrypted with user's pub key,
                        "iv": IV used in AES (this doesn't need to be encrypted),
                    }
                },
                ...
            ]
        }
    }
    That is, a map specifying a private key associated with a file, along with a map of
    permissions, where key is the UUID of a user and value is the permission being
    granted (note that a 'write' implies a 'read').
    """
    req_json = request.get_json(silent=True)
    if req_json is None:
        return "Invalid JSON was passed", 400

    for user_uuid, permission in req_json["permissions"].items():
        queueing_api.send_message(user_uuid)

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
        acl_client, str(current_user.get_id()), str(record_id),
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
        data.append({
            "userEmail": user.email,
            "permissionType": permission,
        })

    return JsonResponse(data=data, status=200)

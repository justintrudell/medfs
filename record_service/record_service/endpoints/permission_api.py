from flask import Blueprint, request
from typing import Tuple

from record_service.external import queueing_api

permission_api = Blueprint("permission_api", __name__)


@permission_api.route("/permissions/<string:record_id>", methods=["POST"])
def update_permissions(record_id: int) -> Tuple[str, int]:
    """
    JSON is expected in the format:
    {
        "privateKey": <val>,
        "permissions": {
            "userEmail": <"read" | "write">,
            ...
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

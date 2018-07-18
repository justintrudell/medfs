from flask import Blueprint

from record_service.external import queueing_api
from uuid import uuid4
import json

message_api = Blueprint("message_api", __name__)


# Client code to test sending
@message_api.route("/messages/send/<string:uuid>/<string:message>", methods=["GET"])
def send(uuid: str, message: str):
    msg = {
        "type": "privateKey",
        "recordId": str(uuid4()),
        "privateKey": message,
        "name": message,
    }
    queueing_api.send_message(uuid, json.dumps(msg))
    return f"SENT {message} TO {uuid}"

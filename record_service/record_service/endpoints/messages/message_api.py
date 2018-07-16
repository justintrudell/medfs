from flask import Blueprint

from record_service.external.queueing import queueing_api

message_api = Blueprint("message_api", __name__)


# Client code to test sending
@message_api.route("/messages/send/<string:uuid>/<string:message>", methods=["GET"])
def send(uuid: str, message: str):
    queueing_api.send_message(uuid, message)
    return f"SENT {message} TO {uuid}"

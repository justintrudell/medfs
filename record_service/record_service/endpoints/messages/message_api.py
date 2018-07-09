import eventlet
from flask import Blueprint, Response, stream_with_context
from flask_login import login_required
import json
from typing import Any

import config
from record_service.api.queueing import queueing_api

message_api = Blueprint("message_api", __name__)


class ServerSentEvent:
    def __init__(self, message: Any) -> None:
        msg_dict = json.loads(message.body)
        self.data = msg_dict["body"]
        self.id = msg_dict["id"]
        self.field_map = {"id": self.id, "data": self.data}

    def encode(self) -> str:
        fields = "\n".join(f"{k}: {v}" for k, v in self.field_map.items() if v)
        return f"{fields}\n\n"


@message_api.route("/messages/stream/<string:user_uuid>", methods=["GET"])
@login_required
def stream_messages(user_uuid: int) -> str:
    @stream_with_context
    def eventStream():
        while True:
            # Poll data from SQS to check for messages, deliver if so
            for message in queueing_api.receive_messages(user_uuid):
                yield ServerSentEvent(message).encode()
                # Delete the message from the queue
                message.delete()
            eventlet.sleep(int(config.SQS_POLLING_INTERVAL_S))

    resp = Response(eventStream(), mimetype="text/event-stream")
    resp.headers["Access-Control-Allow-Credentials"] = "true"
    return resp


# Client code to test consumption
@message_api.route("/messages/send/<string:uuid>/<string:message>", methods=["GET"])
def send(uuid: str, message: str):
    queueing_api.send_message(uuid, message)
    return f"SENT {message} TO {uuid}"

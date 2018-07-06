import eventlet
from flask import Blueprint, Response, stream_with_context

import config
from record_service.api.queueing import queueing_api


message_api = Blueprint("message_api", __name__)


@message_api.route("/messages/stream/<string:user_uuid>", methods=["GET"])
def stream_messages(user_uuid: int) -> str:
    @stream_with_context
    def eventStream():
        while True:
            # Poll data from SQS to check for messages, deliver if so
            messages = queueing_api.receive_messages(user_uuid)
            if messages:
                yield from (x.body for x in messages)
                for message in messages:
                    # Delete the message from the queue
                    message.delete()
            eventlet.sleep(int(config.SQS_POLLING_INTERVAL_S))

    resp = Response(eventStream(), mimetype="text/event-stream")
    resp.headers["Access-Control-Allow-Origin"] = "*"
    resp.headers["Access-Control-Expose-Headers"] = "*"
    resp.headers["Access-Control-Allow-Credentials"] = True
    return resp


# Client code to test consumption
@message_api.route("/messages/send/<string:uuid>/<string:message>", methods=["GET"])
def send(uuid: str, message: str):
    queueing_api.send_message(uuid, message)
    return f"SENT {message} TO {uuid}"

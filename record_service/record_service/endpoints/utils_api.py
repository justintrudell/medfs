import hmac
import hashlib
import config
import logging

from flask import Blueprint, request, jsonify
from record_service.utils.responses import JsonResponse

utils_api = Blueprint("utils_api", __name__)
log = logging.getLogger()


def _verify(
    slack_signature: str, slack_request_timestamp: str, request_body: str
) -> bool:
    basestring = f"v0:{slack_request_timestamp}:{request_body}".encode("utf-8")
    s = bytes(config.SLACK_SIGNING_SECRET, "utf-8")
    sig = "v0=" + hmac.new(s, basestring, hashlib.sha256).hexdigest()
    return hmac.compare_digest(sig, slack_signature)


@utils_api.route("/utils", methods=["POST"])
def handle_slash_command():
    data = request.get_data().decode("utf-8")
    slack_signature = request.headers.get("X-Slack-Signature", "")
    slack_request_timestamp = request.headers.get("X-Slack-Request-Timestamp", "")

    if not _verify(slack_signature, slack_request_timestamp, data):
        return JsonResponse(data="Unauthorized", status=401)

    return jsonify(text="TODO", response_type="in_channel")

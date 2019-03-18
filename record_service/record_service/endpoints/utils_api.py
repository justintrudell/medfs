import hmac
import hashlib
import logging

from flask import Blueprint, request, jsonify
from sqlalchemy import text as sqltext, exc

from record_service.database.database import db
from record_service.models.base import Base
from record_service.utils.responses import JsonResponse
from record_service.utils.sql_scripts import dump_script
from record_service.external import acl_api, acl_pb2
import config

utils_api = Blueprint("utils_api", __name__)
log = logging.getLogger()


def _verify(
    slack_signature: str, slack_request_timestamp: str, request_body: str
) -> bool:
    basestring = f"v0:{slack_request_timestamp}:{request_body}".encode("utf-8")
    s = bytes(config.SLACK_SIGNING_SECRET, "utf-8")
    sig = "v0=" + hmac.new(s, basestring, hashlib.sha256).hexdigest()
    return hmac.compare_digest(sig, slack_signature)


def clean_record_srv():
    Base.metadata.drop_all(bind=db.engine)
    Base.metadata.create_all(bind=db.engine)
    return "cleaned record-srv db"


def clean_acl_srv():
    acl_client = acl_api.build_client(config.ACL_URL, config.ACL_PORT)
    req = acl_pb2.Empty()
    acl_client.CleanDb(req)
    return "cleaned acl-srv db"


def populate_rec_db():
    try:
        db.engine.execute(sqltext(dump_script).execution_options(autocommit=True))
        return "populated record-srv db"
    except exc.IntegrityError as e:
        return "db was already populated"


def populate_acl_db():
    acl_client = acl_api.build_client(config.ACL_URL, config.ACL_PORT)
    req = acl_pb2.Empty()
    acl_client.PopulateDb(req)
    return "populated acl-srv db"


commands = {
    "clean-rec": [clean_record_srv],
    "clean-acl": [clean_acl_srv],
    "clean": [clean_record_srv, clean_acl_srv],
    "populate-rec": [populate_rec_db],
    "populate-acl": [populate_acl_db],
    "populate": [populate_rec_db, populate_acl_db],
}


@utils_api.route("/utils", methods=["POST"])
def handle_slash_command():
    data = request.get_data().decode("utf-8")
    slack_signature = request.headers.get("X-Slack-Signature", "")
    slack_request_timestamp = request.headers.get("X-Slack-Request-Timestamp", "")
    req_str = request.form["text"].strip().lower()

    if not _verify(slack_signature, slack_request_timestamp, data):
        return JsonResponse(data="Unauthorized", status=401)

    try:
        command_list = commands[req_str]
    except KeyError:
        command_str = ", ".join(commands.keys())
        return jsonify(
            text=f"Invalid command {req_str} - valid commands are: {command_str}",
            response_type="in_channel",
        )

    responses = [cmd() for cmd in command_list]
    return jsonify(
        text=f"Success! Actions: {', '.join(responses)}", response_type="in_channel"
    )

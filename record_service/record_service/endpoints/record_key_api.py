from flask import Blueprint
from flask_login import login_required, current_user

from record_service.database.database import db
from record_service.models.record_key import RecordKey

from record_service.utils.responses import JsonResponse


record_key_api = Blueprint("record_key_api", __name__)


@record_key_api.route("/record_keys/<string:record_id>", methods=["GET"])
@login_required
def get_record_key(record_id: str) -> JsonResponse:
    """Gets encrypted AES key and IV for a given record."""

    rk = db.session.query(RecordKey).get((record_id, current_user.get_id()))
    data = {"encryptedAesKey": rk.encrypted_key, "iv": rk.iv}
    return JsonResponse(data=data, status=200)

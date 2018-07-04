from flask import Blueprint
from flask_login import login_required, current_user


from record_service.database.database import db
from record_service.models.record import Record
from record_service.responses import JsonResponse

record_api = Blueprint("record_api", __name__)


@record_api.route("/records", methods=["GET"])
@login_required
def get_all_records_for_user() -> JsonResponse:
    """Lists all the records the current user owns or has access to."""
    records = db.session.query(Record).filter_by(creator_id=current_user.id).all()

    # TODO: query ACL to get list of files user has access to

    if not records:
        # no records for user
        return JsonResponse(message="No records found.", status=204)

    data = [
        {
            "id": str(r.id),
            "name": r.filename,
            "hash": r.record_hash,
            "aclId": str(r.acl_id),
        }
        for r in records
    ]
    return JsonResponse(data=data, status=200)


@record_api.route("/records/<string:record_id>", methods=["GET"])
@login_required
def get_record_for_user(record_id: str) -> JsonResponse:
    """Get the metadata of the file at record_id."""

    record = db.session.query(Record).get(record_id)
    if record is None:
        return JsonResponse(
            message=f"No record with record_id={record_id} found.", status=204
        )

    # TODO query acl to check if user has read access to file
    # if not user_has_read_access:
    #     return JsonResponse(message="Access denied.", status=401)

    return JsonResponse(
        data=record.to_dict(uuid_as_str=True, datetime_as_str=True), status=200
    )


@record_api.route("/records/<int:user_id>/<int:record_id>", methods=["POST"])
def update_record(user_id: int, record_id: int) -> None:
    pass


@record_api.route("/records/<int:user_id>/<int:record_id>", methods=["DELETE"])
def soft_delete_record(user_id: int, record_id: int) -> None:
    pass

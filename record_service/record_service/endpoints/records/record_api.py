from flask import Blueprint, request
from flask_login import login_required, current_user

from record_service.database.database import db
from record_service.models.record import Record
from record_service.utils.responses import JsonResponse
from record_service.utils.file_uploader import FileUploader, IpfsWriter


record_api = Blueprint("record_api", __name__)
UPLOADER = FileUploader(IpfsWriter())


@record_api.route("/records", methods=["GET"])
@login_required
def get_all_records_for_user() -> JsonResponse:
    """Lists all the records the current user owns or has access to."""
    records = db.session.query(Record).filter_by(creator_id=current_user.id).all()

    # TODO: query ACL to get list of files user has access to

    if records is None:
        # no records for user
        return JsonResponse(message="No records found.", data=[], status=204)

    data = [
        {"id": str(r.id), "name": r.filename, "hash": r.record_hash} for r in records
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


@record_api.route("/records", methods=["POST"])
@login_required
def upload_file():
    """Upload file to distributed file store.

    Expects client to pass the following:
    - file: set by multipart
    - data:
      - extension: file extension (i.e. .pdf files = "pdf")
    """
    if "file" not in request.files:
        return "No file.", 400

    data = request.form
    if not all(key in data.keys() for key in ["extension"]):
        return "Missing data", 400

    new_record = UPLOADER.upload(request.files["file"], data["extension"])
    new_record.creator_id = current_user.get_id()

    db.session.add(new_record)
    db.session.commit()

    return "Success", 200

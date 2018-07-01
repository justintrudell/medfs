from flask import Blueprint, current_app


record_api = Blueprint("record_api", __name__)


@record_api.route("/records/<int:user_id>", methods=["GET"])
def get_all_records_for_user(user_id: int) -> str:
    current_app.logger.info("Example info log")
    return "All"


@record_api.route("/records/<int:user_id>/<int:record_id>", methods=["GET"])
def get_record_for_user(user_id: int, record_id: int) -> str:
    return "Record"


@record_api.route("/records/<int:user_id>/<int:record_id>", methods=["POST"])
def update_record(user_id: int, record_id: int) -> None:
    pass


@record_api.route("/records/<int:user_id>/<int:record_id>", methods=["DELETE"])
def soft_delete_record(user_id: int, record_id: int) -> None:
    pass

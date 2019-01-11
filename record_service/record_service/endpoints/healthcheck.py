from flask import Blueprint
from record_service.utils.responses import JsonResponse

healthcheck = Blueprint("healthcheck", __name__)


@healthcheck.route("/healthcheck", methods=["GET"])
def check():
    return JsonResponse(data="healthy!")

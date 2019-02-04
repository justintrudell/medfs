from flask import Blueprint, request
from flask_login import login_required, current_user
from sqlalchemy.exc import IntegrityError

from record_service.database.database import db
from record_service.models.user import User
from record_service.models.patient_doctors import PatientDoctors

from record_service.utils.decorators import doctor_required
from record_service.utils.responses import JsonResponse

patients_api = Blueprint("patients_api", __name__, url_prefix="/patients")


@patients_api.route("/add", methods=["POST"])
@login_required
@doctor_required
def add_patient() -> JsonResponse:
    data = request.get_json()
    if "email" not in data.keys():
        return JsonResponse(message="Bad Request", status=400)

    patient_email = data["email"]

    patient = db.session.query(User) \
        .filter(User.email == patient_email) \
        .one_or_none()
    if not patient:
        # TODO: add logic to send email to create account
        return JsonResponse(message="User not found.", status=404)

    try:
        db.session.add(
            PatientDoctors(
                patient_id=patient.id,
                doctor_id=current_user.id,
                # default to true for now until we implement feedback
                accepted=True,
            )
        )
        db.session.commit()
        return JsonResponse(message="success", status=200)
    except IntegrityError:
        # patient-doctor relationship already exists
        return JsonResponse(
            message="Patient-Doctor exists already.",
            status=302,
        )


@patients_api.route("/get", methods=["GET"])
@login_required
@doctor_required
def get_all_patients() -> JsonResponse:
    patients = db.session.query(
        *PatientDoctors.__table__.columns,
        User.email,
    ) \
        .join(User, User.id == PatientDoctors.patient_id) \
        .filter(PatientDoctors.doctor_id == current_user.get_id()) \
        .all()
    data = [{
        "id": str(patient.patient_id),
        "email": patient.email,
        "dateAdded": patient.date_added.isoformat(),
    } for patient in patients]

    return JsonResponse(data=data, status=200)

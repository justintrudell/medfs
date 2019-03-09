from flask import Blueprint, request
from flask_login import login_required, current_user

from record_service.database.database import db
from record_service.utils.decorators import patient_required
from record_service.utils.responses import JsonResponse
from record_service.models.patient import Patient, BloodType, Sex
from record_service.models.patient_doctors import PatientDoctors
from record_service.models.doctor import Doctor
from record_service.models.user import User

doctors_api = Blueprint("doctors_api", __name__, url_prefix="/doctors")


@doctors_api.route("/get", methods=["GET"])
@login_required
@patient_required
def get_all_doctors() -> JsonResponse:
    doctors = (
        db.session.query(
            *PatientDoctors.__table__.columns, User.email, PatientDoctors.date_added
        )
        .join(User, User.id == PatientDoctors.doctor_id)
        .filter(PatientDoctors.patient_id == current_user.get_id())
        .filter(PatientDoctors.accepted == True)
        .all()
    )
    print(doctors)
    data = [
        {
            "id": str(doctor.doctor_id),
            "email": doctor.email,
            "dateAdded": doctor.date_added.isoformat(),
        }
        for doctor in doctors
    ]

    return JsonResponse(data=data, status=200)

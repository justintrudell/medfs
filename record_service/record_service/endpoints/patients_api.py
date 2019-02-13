from flask import Blueprint, request
from flask_login import login_required, current_user
from sqlalchemy.exc import IntegrityError
from datetime import datetime
from typing import Dict

from record_service.database.database import db
from record_service.models.user import User
from record_service.models.patient_doctors import PatientDoctors
from record_service.models.patient import Patient, BloodType, Sex
from record_service.models.doctor import Doctor

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
    patients = (
        db.session.query(*PatientDoctors.__table__.columns, User.email)
        .join(User, User.id == PatientDoctors.patient_id)
        .filter(PatientDoctors.doctor_id == current_user.get_id())
        .filter(PatientDoctors.accepted == True)  # noqa E712
        .all()
    )
    data = [
        {
            "id": str(patient.patient_id),
            "email": patient.email,
            "dateAdded": patient.date_added.isoformat(),
        }
        for patient in patients
    ]

    return JsonResponse(data=data, status=200)


@patients_api.route("/update", methods=["POST"]) # noqa C901
@login_required
def update_patient_info() -> JsonResponse:
    doctor = db.session.query(Doctor).get(current_user.get_id())
    if doctor is not None:
        # doctors arent patients so they cant update patient info model
        return JsonResponse(message="Bad Request", status=400)

    patient_info = db.session.query(Patient).get(current_user.get_id())
    new_patient_info = False
    if patient_info is None:
        patient_info = Patient(
            user_id=current_user.get_id()
        )
        new_patient_info = True

    data = request.get_json()

    if data.get("primaryPhysician"):
        physician = db.session.query(Doctor).get(data["primaryPhysician"])
        if physician is None:
            return JsonResponse(message="No Doctor found.", status=400)
        patient_info.primary_physician = physician.id

    if data.get("dateOfBirth"):
        patient_info.date_of_birth = datetime \
            .strptime(data["dateOfBirth"], "%Y-%m-%d") \
            .date()

    if data.get("bloodType"):
        if not BloodType.has_value(data["bloodType"]):
            return JsonResponse(message="Bad Blood Type", status=400)
        patient_info.blood_type = BloodType.get_item(data["bloodType"])

    if data.get("sex"):
        if not Sex.has_value(data.get("sex")):
            return JsonResponse(message="Bad Sex", status=400)
        patient_info.sex = Sex.get_item(data["sex"])

    if data.get("firstName"):
        patient_info.first_name = data["firstName"]

    if data.get("lastName"):
        patient_info.last_name = data["lastName"]

    if new_patient_info:
        db.session.add(patient_info)
    else:
        db.session.merge(patient_info)
    db.session.commit()

    return JsonResponse(message="Success", status=200)


@patients_api.route("/info", methods=["GET"])
@login_required
def get_patient_info() -> JsonResponse:
    """ Gets the info of the current patient."""
    doctor = db.session.query(Doctor).get(current_user.get_id())
    if doctor is not None:
        # doctors arent patients so they dont have a patient info
        return JsonResponse(message="Bad Request", status=400)

    patient_info = _get_patient_info(current_user.get_id())
    return JsonResponse(data=patient_info, status=200)


@patients_api.route("/info/<string:patient_id>", methods=["GET"])
@login_required
@doctor_required
def get_patient_info_as_doctor(patient_id: str) -> JsonResponse:
    doctor_patient = db.session.query(PatientDoctors) \
        .filter(PatientDoctors.patient_id == patient_id,
                PatientDoctors.doctor_id == current_user.get_id()) \
        .one_or_none()
    if doctor_patient is None:
        return JsonResponse(message="Forbidden", status=403)

    patient_info = _get_patient_info(patient_id)
    return JsonResponse(data=patient_info, status=200)


def _get_patient_info(patient_id: str) -> Dict[str, str]:
    patient = db.session.query(User.email, *Patient.__table__.columns) \
        .join(Patient, User.id == Patient.user_id) \
        .filter(Patient.user_id == patient_id) \
        .first()

    if patient is None:
        return {
            "id": str(current_user.get_id()),
            "dateOfBirth": None,
            "bloodType": None,
            "sex": None,
            "firstName": None,
            "lastName": None,
        }

    return {
        "id": str(current_user.get_id()),
        "dateOfBirth":
            patient.date_of_birth.strftime("%Y-%m-%d")
            if patient.date_of_birth else None,
        "bloodType": patient.blood_type.value if patient.blood_type else None,
        "sex": patient.sex.value if patient.sex else None,
        "firstName": patient.first_name,
        "lastName": patient.last_name,
    }

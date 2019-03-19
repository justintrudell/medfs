from flask import Blueprint, request
from flask_login import login_required, current_user
from sqlalchemy.exc import IntegrityError
from sqlalchemy import func
from datetime import datetime
from typing import Dict
import json

import config
from record_service.database.database import db
from record_service.models.doctor import Doctor
from record_service.models.notification import Notification, NotificationType
from record_service.models.patient import Patient, BloodType, Sex
from record_service.models.patient_doctors import PatientDoctors
from record_service.models.record import Record
from record_service.models.user import User

from record_service.utils.decorators import doctor_required
from record_service.utils.responses import JsonResponse
from record_service.external import acl_api, queueing_api
from record_service.utils.exceptions import UserNotFoundError

patients_api = Blueprint("patients_api", __name__, url_prefix="/patients")


@patients_api.route("/add", methods=["POST"])
@login_required
@doctor_required
def add_patient() -> JsonResponse:
    data = request.get_json()
    if "email" not in data.keys():
        return JsonResponse(message="Bad Request", status=400)

    patient_email = data["email"]

    patient = db.session.query(User).filter(User.email == patient_email).one_or_none()
    if not patient:
        # TODO: add logic to send email to create account
        return JsonResponse(message="User not found.", status=404)

    doctor = db.session.query(User).get(current_user.get_id())

    try:
        db.session.add(
            PatientDoctors(
                patient_id=patient.id, doctor_id=current_user.id, accepted=False
            )
        )

        notification = Notification(
            user_id=patient.id,
            sender=current_user.get_id(),
            notification_type=NotificationType.ADD_USER,
            content=dict(
                doctorEmail=doctor.email,
                doctorId=str(doctor.id),
                accepted=False,
                acked=False,
            ),
        )

        db.session.add(notification)
        queueing_api.send_message(str(patient.id), notification.to_json())
        db.session.commit()
        return JsonResponse(message="success", status=200)
    except IntegrityError:
        # patient-doctor relationship already exists
        return JsonResponse(message="Patient-Doctor exists already.", status=302)


@patients_api.route("/get", methods=["GET"])
@login_required
@doctor_required
def get_all_patients() -> JsonResponse:
    acl_client = acl_api.build_client(config.ACL_URL, config.ACL_PORT)
    common_records = acl_api.find_common_records(acl_client, str(current_user.get_id()))

    patients = (
        db.session.query(*PatientDoctors.__table__.columns, User.email)
        .join(User, User.id == PatientDoctors.patient_id)
        .filter(PatientDoctors.doctor_id == current_user.get_id())
        .filter(PatientDoctors.accepted == True)  # noqa E712
        .all()
    )

    data = []
    for patient in patients:
        key = str(patient.patient_id)
        last_update = None
        if key in common_records.records:
            common_recs = [r.record.id for r in common_records.records[key].records]
            last_update = (
                db.session.query(func.max(Record.created))
                .filter(Record.id.in_(common_recs))
                .scalar()
            ).isoformat()

        data.append(
            {
                "id": str(patient.patient_id),
                "email": patient.email,
                "dateAdded": patient.date_added.isoformat(),
                "lastUpdate": last_update,
            }
        )

    return JsonResponse(data=data, status=200)


@patients_api.route("/update", methods=["POST"])  # noqa C901
@login_required
def update_patient_info() -> JsonResponse:
    doctor = db.session.query(Doctor).get(current_user.get_id())
    if doctor is not None:
        # doctors arent patients so they cant update patient info model
        return JsonResponse(message="Bad Request", status=400)

    patient_info = db.session.query(Patient).get(current_user.get_id())
    if not patient_info:
        return JsonResponse(message="User not found", status=404)

    data = request.get_json()

    if data.get("primaryPhysician"):
        physician = db.session.query(Doctor).get(data["primaryPhysician"])
        if physician is None:
            return JsonResponse(message="No Doctor found.", status=400)
        patient_info.primary_physician = physician.id

    if data.get("dateOfBirth"):
        patient_info.date_of_birth = datetime.strptime(
            data["dateOfBirth"], "%Y-%m-%d"
        ).date()

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

    try:
        patient_info = _get_patient_info(str(current_user.get_id()))
    except UserNotFoundError:
        return JsonResponse(message="Patient not found", status=404)

    return JsonResponse(data=patient_info, status=200)


@patients_api.route("/info/<string:patient_id>", methods=["GET"])
@login_required
@doctor_required
def get_patient_info_as_doctor(patient_id: str) -> JsonResponse:
    doctor_patient = (
        db.session.query(PatientDoctors)
        .filter(
            PatientDoctors.patient_id == patient_id,
            PatientDoctors.doctor_id == current_user.get_id(),
        )
        .one_or_none()
    )
    if doctor_patient is None:
        return JsonResponse(message="Forbidden", status=403)

    try:
        patient_info = _get_patient_info(patient_id)
    except UserNotFoundError:
        return JsonResponse(message="Patient not found", status=404)

    return JsonResponse(data=patient_info, status=200)


def _get_patient_info(patient_id: str) -> Dict[str, str]:
    patient = (
        db.session.query(User.email, *Patient.__table__.columns)
        .join(Patient, User.id == Patient.user_id)
        .filter(Patient.user_id == patient_id)
        .first()
    )

    if patient is None:
        raise UserNotFoundError(f"Patient {patient_id} does not exist.")

    return {
        "id": patient_id,
        "email": patient.email,
        "dateOfBirth": patient.date_of_birth.strftime("%Y-%m-%d")
        if patient.date_of_birth
        else None,
        "bloodType": patient.blood_type.value if patient.blood_type else None,
        "sex": patient.sex.value if patient.sex else None,
        "firstName": patient.first_name,
        "lastName": patient.last_name,
    }


@patients_api.route("/records/<string:patient_id>")
@login_required
@doctor_required
def get_all_records_for_patient(patient_id: str) -> JsonResponse:
    # lil' smoke check to make sure the patient is associated with doctor
    # should be handled by ACL service but it's fine
    doctor_patient = (
        db.session.query(PatientDoctors)
        .filter(
            PatientDoctors.patient_id == patient_id,
            PatientDoctors.doctor_id == current_user.get_id(),
        )
        .one_or_none()
    )
    if doctor_patient is None:
        return JsonResponse(message="Forbidden", status=403)

    # Query ACL to get list of files user has access to
    acl_client = acl_api.build_client(config.ACL_URL, config.ACL_PORT)
    doctor_records = acl_api.get_records_for_user(
        acl_client, str(current_user.get_id())
    )

    # Also get all the files
    patient_records = acl_api.get_records_for_user(acl_client, patient_id)

    record_intersection = list(
        set(doctor_records.keys()).intersection(set(patient_records.keys()))
    )

    records = db.session.query(Record).filter(Record.id.in_(record_intersection)).all()

    if records is None:
        return JsonResponse(message="No records found.", data=[], status=204)

    data = [
        {
            "id": str(r.id),
            "name": r.filename,
            "hash": r.record_hash,
            "created": r.created.isoformat(),
        }
        for r in records
    ]

    # Not the most performant but we're dealing with O(10) entries right now
    for d in data:
        permissioned_user_ids = [
            u[0] for u in acl_api.get_users_for_record(acl_client, d["id"])
        ]
        d["permissioned_users"] = [
            {"id": str(u.id), "email": u.email}
            for u in db.session.query(User)
            .filter(User.id.in_(permissioned_user_ids))
            .all()
        ]

    return JsonResponse(data=data, status=200)


@patients_api.route("/respond", methods=["POST"])
@login_required
def respond_to_add_patient_request() -> JsonResponse:
    data = request.get_json()

    if not all(k in data.keys() for k in ["doctorId", "accepted", "notificationId"]):
        return JsonResponse(message="Bad Request", status=400)

    patient_doctor = (
        db.session.query(PatientDoctors)
        .filter(
            PatientDoctors.doctor_id == data["doctorId"],
            PatientDoctors.patient_id == current_user.get_id(),
        )
        .one_or_none()
    )

    if patient_doctor is None:
        return JsonResponse(message="Request not found", status=404)

    if patient_doctor.accepted:
        return JsonResponse(message="already responded", status=302)

    notification = db.session.query(Notification).get(data["notificationId"])
    if notification is None:
        return JsonResponse(message="Bad Request, notification not found", status=404)

    if not data["accepted"]:
        # delete the row because it makes life easier
        db.session.delete(patient_doctor)
    else:
        patient_doctor.accepted = True

    # update the notification to acknowledge that it has been responded to
    content = notification.to_dict()["content"]
    content["accepted"] = data["accepted"]
    content["acked"] = True
    notification.content = json.dumps(content)

    # TODO send doctor a notification saying the request has been replied to

    db.session.commit()
    return JsonResponse(message="success", status=200)

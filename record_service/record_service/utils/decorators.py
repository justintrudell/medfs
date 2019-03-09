from flask_login import current_user
from functools import wraps

from record_service.database.database import db
from record_service.models.doctor import Doctor
from record_service.models.patient import Patient
from record_service.utils.responses import JsonResponse


def doctor_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # Definitely should cache this with the session but we don't have many
        # users so not a big deal rn
        doctor = (
            db.session.query(Doctor)
            .filter(Doctor.user_id == current_user.get_id())
            .first()
        )
        if doctor:
            return f(*args, **kwargs)
        return JsonResponse(message="Not a doctor.", status=403)

    return decorated_function


def patient_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        patient = (
            db.session.query(Patient)
            .filter(Patient.user_id == current_user.get_id())
            .first()
        )
        if patient:
            return f(*args, **kwargs)
        return JsonResponse(message="Not a patient.", status=403)

    return decorated_function

from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime

from record_service.database.database import db
from record_service.models.base import Base
from record_service.models.patient import Patient
from record_service.models.doctor import Doctor


class PatientDoctors(Base):
    """Allows for a many to many relationship between patients and doctors
    """

    __tablename__ = "patient_doctors"

    patient_id = db.Column(
        UUID(as_uuid=True), db.ForeignKey(Patient.user_id), primary_key=True
    )
    doctor_id = db.Column(
        UUID(as_uuid=True), db.ForeignKey(Doctor.user_id), primary_key=True
    )
    accepted = db.Column(db.Boolean, default=False, nullable=False)
    date_added = db.Column(db.DateTime, default=datetime.now(), nullable=False)

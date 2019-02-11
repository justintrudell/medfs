from record_service.database.database import db
from record_service.models.base import Base
from record_service.models.user import User
from record_service.models.doctor import Doctor
from sqlalchemy.dialects.postgresql import UUID


class Patient(Base):
    """Stores patient-specific data.
    """

    __tablename__ = "patients"

    user_id = db.Column(UUID(as_uuid=True), db.ForeignKey(User.id), primary_key=True)
    primary_physician = db.Column(UUID(as_uuid=True), db.ForeignKey(Doctor.user_id))

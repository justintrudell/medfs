from record_service.database.database import db
from record_service.models.base import Base
from record_service.models.user import User
from record_service.models.doctor import Doctor
from sqlalchemy.dialects.postgresql import UUID
from enum import Enum


class BaseEnum(Enum):
    @classmethod
    def has_value(cls, value):
        return any(value == item.value for item in cls)

    @classmethod
    def get_item(cls, value):
        return next(filter(lambda i: value == i.value, cls))


class BloodType(BaseEnum):
    a_neg = "A-"
    a_pos = "A+"
    b_neg = "B-"
    b_pos = "B+"
    ab_neg = "AB-"
    ab_pos = "AB+"
    o_neg = "O-"
    o_pos = "O+"


class Sex(BaseEnum):
    male = "Male"
    female = "Female"


class Patient(Base):
    """Stores patient-specific data.
    """

    __tablename__ = "patients"

    user_id = db.Column(UUID(as_uuid=True), db.ForeignKey(User.id), primary_key=True)
    primary_physician = db.Column(UUID(as_uuid=True), db.ForeignKey(Doctor.user_id))
    date_of_birth = db.Column(db.Date)
    blood_type = db.Column(db.Enum(BloodType))
    sex = db.Column(db.Enum(Sex))
    first_name = db.Column(db.Text)
    last_name = db.Column(db.Text)

from record_service.database.database import db
from record_service.models.base import Base
from record_service.models.user import User
from sqlalchemy.dialects.postgresql import UUID


class Doctor(Base):
    """Stores doctor-specific data.
    """

    __tablename__ = "doctors"

    user_id = db.Column(UUID(as_uuid=True), db.ForeignKey(User.id), primary_key=True)

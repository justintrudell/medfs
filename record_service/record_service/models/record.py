from record_service.database.database import db
from record_service.models.base import Base
from record_service.models.user import User
from sqlalchemy.dialects.postgresql import UUID
import uuid


class Record(Base):
    __tablename__ = "records"

    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    creator_id = db.Column(UUID(as_uuid=True), db.ForeignKey(User.id), nullable=False)
    acl_id = db.Column(UUID(as_uuid=True), nullable=False)
    archived = db.Column(db.Boolean, nullable=False, default=False)
    record_hash = db.Column(db.Text, nullable=False)
    filename = db.Column(db.Text, nullable=False)
    created = db.Column(db.DateTime, nullable=False)

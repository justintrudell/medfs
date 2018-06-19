from record_service.database.database import db
from record_service.models.base import Base
from sqlalchemy.dialects.postgresql import UUID
import uuid


class Record(Base):
    __tablename__ = "records"

    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    archived = db.column(db.Boolean)
    hash = db.Column(db.Text)
    # Need metadata, other shit

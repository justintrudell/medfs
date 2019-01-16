from record_service.database.database import db
from record_service.models.base import Base
from record_service.models.user import User
from record_service.models.record import Record
from sqlalchemy.dialects.postgresql import UUID


class RecordKey(Base):
    """Stores AES keys that were used to encrypt records, which are themselves encrypted
    by a given user's key pair.
    """

    __tablename__ = "record_keys"

    record_id = db.Column(
        UUID(as_uuid=True), db.ForeignKey(Record.id), primary_key=True
    )
    user_id = db.Column(UUID(as_uuid=True), db.ForeignKey(User.id), primary_key=True)
    encrypted_key = db.Column(db.Text, nullable=False)
    iv = db.Column(db.Text, nullable=False)

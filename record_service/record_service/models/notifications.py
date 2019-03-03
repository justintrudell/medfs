import uuid
import json

from record_service.database.database import db
from record_service.models.base import Base
from record_service.models.user import User
from sqlalchemy.dialects.postgresql import UUID
from enum import Enum


class NotificationType(Enum):
    CREATE = "CREATE"
    UPDATE = "UPDATE"
    REVOKE = "REVOKE"
    ADD_USER = "ADD_USER"


class Notification(Base):
    """Stores notification data for a user"""

    __tablename__ = "notifications"

    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = db.Column(UUID(as_uuid=True), db.ForeignKey(User.id))
    notification_type = db.Column(db.Enum(NotificationType))
    sender = db.Column(UUID(as_uuid=True), db.ForeignKey(User.id), nullable=True)
    content = db.Column(db.Text)

    def to_dict(self):
        return {
            # reload JSON object for api responses
            "content": json.loads(self.content),
            "id": str(self.id),
            "notificationType": self.notification_type.value,
            "sender": str(self.sender),
            "userId": str(self.user_id),
        }

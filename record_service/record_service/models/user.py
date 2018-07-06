from flask_login.mixins import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash
from sqlalchemy.dialects.postgresql import UUID
import uuid

from record_service.database.database import db
from record_service.models.base import Base


class User(Base, UserMixin):
    __tablename__ = "users"

    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = db.Column(db.Text, nullable=False)
    password = db.Column(db.Text, nullable=False)

    @staticmethod
    def hash_password(password: str) -> str:
        return generate_password_hash(password)

    @staticmethod
    def check_password(hashpw: str, password: str) -> bool:
        return check_password_hash(hashpw, password)

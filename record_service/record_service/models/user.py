from flask_login.mixins import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash
from itsdangerous import URLSafeTimedSerializer
from sqlalchemy.dialects.postgresql import UUID
from typing import Union
import uuid

from record_service.database.database import db
from record_service.models.base import Base
from record_service.constants import SECRET_KEY


class User(Base, UserMixin):
    __tablename__ = "users"

    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = db.Column(db.Text, nullable=False)
    hashed_password = db.Column(db.Text, nullable=False)

    def get_id(self) -> Union[str, bytes]:
        serializer = URLSafeTimedSerializer(SECRET_KEY)
        return serializer.dumps([self.email, self.hashed_password])

    @staticmethod
    def hash_password(password: str) -> str:
        return generate_password_hash(password)

    @staticmethod
    def check_password(hashpw: str, password: str) -> bool:
        return check_password_hash(hashpw, password)

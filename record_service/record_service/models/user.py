from flask_login.mixins import UserMixin
from werkzeug.security import (generate_password_hash,
                               check_password_hash)
from itsdangerous import URLSafeTimedSerializer

from record_service.database.database import db
from record_service.models.base import Base
from record_service.constants import SECRET_KEY


class User(Base, UserMixin):
    __tablename__ = "users"

    id = db.Column(db.Text, primary_key=True)
    hashed_password = db.Column(db.Text, nullable=False)

    def get_id(self) -> str:
        serializer = URLSafeTimedSerializer(SECRET_KEY)
        return serializer.dumps([self.id, self.hashed_password])

    @staticmethod
    def hash_password(password: str) -> str:
        return generate_password_hash(password)

    @staticmethod
    def check_password(hashpw: str, password: str) -> bool:
        return check_password_hash(hashpw, password)

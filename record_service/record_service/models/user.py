import uuid

from cryptography.hazmat.primitives.serialization import (
    load_pem_public_key,
    load_pem_private_key,
)
from cryptography.hazmat.backends import default_backend
from flask_login.mixins import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import validates

from record_service.database.database import db
from record_service.models.base import Base
from record_service.utils.exceptions import (
    UnencryptedKeyProvidedError,
    InvalidKeyFormatError,
    InvalidKeyPasswordError,
)


class User(Base, UserMixin):
    __tablename__ = "users"

    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = db.Column(db.Text, nullable=False)
    password = db.Column(db.Text, nullable=False)
    public_key = db.Column(db.Text, nullable=False)
    private_key = db.Column(db.Text, nullable=False)

    @staticmethod
    def hash_password(password: str) -> str:
        return generate_password_hash(password)

    @staticmethod
    def check_password(hashpw: str, password: str) -> bool:
        return check_password_hash(hashpw, password)

    @staticmethod
    def validate_password_for_private_key(password: str, private_key: str):
        try:
            load_pem_private_key(
                private_key.encode(),
                password=password.encode(),
                backend=default_backend(),
            )
        except ValueError:
            raise InvalidKeyPasswordError

    @validates("public_key")
    def validate_public_key(self, name: str, public_key: str) -> str:
        try:
            load_pem_public_key(public_key.encode(), backend=default_backend())
        except ValueError:
            raise InvalidKeyFormatError
        return public_key

    @validates("private_key")
    def validate_private_key(self, name: str, private_key: str) -> str:
        try:
            load_pem_private_key(
                private_key.encode(), password=None, backend=default_backend()
            )
        except TypeError:
            # This implies the key was encrypted, which is what we want
            return private_key
        except ValueError:
            raise InvalidKeyFormatError
        raise UnencryptedKeyProvidedError

from record_service.database.database import db
from record_service.models.base import Base


class User(Base):
    __tablename__ = "users"

    id = db.Column(db.Text, primary_key=True)
    password_hash = db.Column(db.Text, nullable=False)
    password_salt = db.Column(db.Text, nullable=False)

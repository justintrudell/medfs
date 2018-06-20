from record_service.database.database import db
from record_service.models.base import Base


class User(Base):
    __tablename__ = "users"

    id = db.Column(db.Text, primary_key=True)
    hashed_password = db.Column(db.Text, nullable=False)

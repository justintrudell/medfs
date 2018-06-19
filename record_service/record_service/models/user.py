from record_service.database.database import db
from record_service.models.base import Base


class User(Base):
    __tablename__ = "users"

    # This should probably be an email
    id = db.Column(db.Text, primary_key=True)
    # Need password, metadata, other shit

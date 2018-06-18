from record_service.database.database import db


class User(db.Model):
    __tablename__ = "users"

    # This should probably be an email
    id = db.Column(db.Integer, primary_key=True)
    # Need password, metadata, other shit

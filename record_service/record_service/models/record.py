from record_service.database.database import db


class Record(db.Model):
    __tablename__ = 'records'

    id = db.Column(db.Integer, primary_key=True)
    archived = db.column(db.Boolean)
    hash = db.Column(db.Text)

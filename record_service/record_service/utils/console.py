from app import app
from record_service.models import *  # noqa
from record_service.database.database import db  # noqa

app.app_context().push()

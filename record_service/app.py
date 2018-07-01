import logging.config

from flask import Flask

import config

from record_service.database.database import db
from record_service.endpoints.authentication.auth_api import login_manager
from record_service.constants import SECRET_KEY

# DB Models - import required to create tables
from record_service.models.base import Base
from record_service.models.user import User  # noqa F401
from record_service.models.record import Record  # noqa F401

# API Endpoints
from record_service.endpoints.permissions.permission_api import permission_api
from record_service.endpoints.records.record_api import record_api
from record_service.endpoints.users.user_api import user_api
from record_service.endpoints.authentication.auth_api import auth_api

app = Flask(__name__)

# Configure logging, adding gunicorn log handlers to Flask logger
if __name__ != "__main__":
    gunicorn_logger = logging.getLogger("gunicorn.error")
    app.logger.handlers = gunicorn_logger.handlers
    app.logger.setLevel(gunicorn_logger.level)

app.config["SQLALCHEMY_DATABASE_URI"] = (
    f"postgresql://{config.DB_USER}:{config.DB_PASS}@{config.DB_URL}"
    f":{config.DB_PORT}/{config.DB_NAME}"
)
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = True

app.secret_key = SECRET_KEY

apis = [auth_api, permission_api, record_api, user_api]
[app.register_blueprint(api) for api in apis]

db.init_app(app)
login_manager.init_app(app)


@app.before_first_request
def setup_db():
    # create tables if not exists
    Base.metadata.create_all(bind=db.engine)
    db.session.commit()


def run():
    port = int(config.APP_PORT or 5000)
    app.run(host="0.0.0.0", port=port)


if __name__ == "__main__":
    run()

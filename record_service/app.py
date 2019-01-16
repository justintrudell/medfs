import logging.config

from flask import Flask
from flask_cors import CORS

import config

from record_service.database.database import db
from record_service.endpoints.auth_api import login_manager
from record_service.utils.constants import SECRET_KEY

# DB Models - import required to create tables
from record_service.models.base import Base
from record_service.models.user import User  # noqa F401
from record_service.models.record import Record  # noqa F401
from record_service.models.record_key import RecordKey  # noqa F401

# API Endpoints
from record_service.endpoints.auth_api import auth_api
from record_service.endpoints.message_api import message_api
from record_service.endpoints.permission_api import permission_api
from record_service.endpoints.record_api import record_api
from record_service.endpoints.user_api import user_api
from record_service.endpoints.healthcheck import healthcheck

# External APIs
from record_service.external import acl_api


app = Flask(__name__)
CORS(app)

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

apis = [auth_api, message_api, permission_api, record_api, user_api, healthcheck]
[app.register_blueprint(api) for api in apis]

db.init_app(app)
login_manager.init_app(app)

acl_service = acl_api.build_client(
    config.ACL_URL or "localhost", config.ACL_PORT or 5002
)


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

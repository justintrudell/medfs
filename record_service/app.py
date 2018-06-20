import logging.config
import pathlib

from flask import Flask

import config
from record_service.database.database import db
from record_service.endpoints.permissions.permission_api import permission_api
from record_service.endpoints.records.record_api import record_api
from record_service.endpoints.users.user_api import user_api

app = Flask(__name__)

app.config[
    "SQLALCHEMY_DATABASE_URI"
] = f"postgresql+pg8000://tesuser:password@db:5432/local_record_service"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.register_blueprint(permission_api)
app.register_blueprint(record_api)
app.register_blueprint(user_api)
db.init_app(app)


def configure_logging():
    """Configures app-wide logging functionality."""
    pathlib.Path("log").mkdir(parents=True, exist_ok=True)
    logging.config.dictConfig(config.logging_config)


configure_logging()


def run():
    port = int(config.APP_PORT or 5000)
    app.run(host="0.0.0.0", port=port)


if __name__ == "__main__":
    run()

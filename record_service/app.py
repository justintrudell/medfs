import logging.config 
import os
import pathlib

from flask import Flask

import config
from record_service.database.database import db
from record_service.endpoints.user import user_api 

app = Flask(__name__)

app.config['SQLALCHEMY_DATABASE_URI'] = (
  f"postgresql+pg8000://tesuser:password@db:5432/local_record_service"
)
app.register_blueprint(user_api.user_api)
db.init_app(app)


def configure_logging():
  """Configures app-wide logging functionality."""
  pathlib.Path('log').mkdir(parents=True, exist_ok=True) 
  logging.config.dictConfig(config.logging_config)
  logger = logging.getLogger('record_service.root')
  logger.info("Starting application...")


configure_logging()


def run():
  port = int(os.environ.get('RECORD_SVC_PORT', 5000))
  app.run(host='0.0.0.0', port=port)


if __name__ == '__main__':
  run()
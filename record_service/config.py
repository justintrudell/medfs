from os import environ

APP_PORT = environ.get('RECORD_SVC_PORT')

# Database parameters
DB_USER = environ.get('RECORD_SVC_DB_USER')
DB_PASS = environ.get('RECORD_SVC_DB_PASS')
DB_URL = environ.get('RECORD_SVC_DB_URL')
DB_NAME = environ.get('RECORD_SVC_DB_NAME')
DB_PORT = environ.get('RECORD_SVC_DB_PORT')

logging_config = {
  'version': 1,
  'formatters': {
    'default': {
      'format': '%(asctime)s - %(levelname)s: %(message)s'
    }
  },
  'handlers': {
    'console_err': {
      'class': 'logging.StreamHandler',
      'stream': 'ext://sys.stderr',
      'level': 'ERROR',
      'formatter': 'default',
    },
    'core_file': {
      'class': 'logging.handlers.RotatingFileHandler',
      'formatter': 'default',
      'level': 'INFO',
      'filename': 'log/record_service.log',
      'maxBytes': 10**8,
      'backupCount': 1
    },
    'debug_file': {
      'class': 'logging.handlers.RotatingFileHandler',
      'formatter': 'default',
      'level': 'DEBUG',
      'filename': 'log/record_service_debug.log',
      'maxBytes': 10**8,
      'backupCount': 1
    }
  },
  'loggers': {
    'record_service.root': {
      'handlers': ['core_file']
    },
    'record_service.error': {
      'handlers': ['console_err']
    },
    'record_service.debug': {
      'handlers': ['debug_file']
    },
  }
}

from app import app
from record_service.models import *  # noqa
from record_service.database.database import db  # noqa
from record_service.external import acl_pb2, acl_pb2_grpc as acl_func
from record_service.external import acl_api
import config

app.app_context().push()

client = acl_api.build_client(config.ACL_URL, config.ACL_PORT)

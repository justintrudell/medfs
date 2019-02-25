from sqlalchemy import create_engine
from os import environ

db_string = "postgresql://%s:%s@%s:%s/%s" % (
    environ.get("ACL_SVC_DB_USER"),
    environ.get("ACL_SVC_DB_PASS"),
    environ.get("ACL_SVC_DB_URL"),
    environ.get("ACL_SVC_DB_PORT"),
    environ.get("ACL_SVC_DB_NAME"),
)
db = create_engine(db_string, pool_pre_ping=True)

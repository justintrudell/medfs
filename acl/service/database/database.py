from sqlalchemy import create_engine

db_string = "postgres://testuser:password@db:5432/local_acl_service"
db = create_engine(db_string)
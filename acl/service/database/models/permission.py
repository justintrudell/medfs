from database.models.base import Base
from sqlalchemy import Column, Boolean
from sqlalchemy.dialects.postgresql import UUID


# Many to one relationship between permission and role
class Permission(Base):
    __tablename__ = "permission"

    user_id = Column(UUID(as_uuid=True), primary_key=True, nullable=False)
    record_id = Column(UUID(as_uuid=True), primary_key=True, nullable=False)
    is_readonly = Column(Boolean, nullable=False)

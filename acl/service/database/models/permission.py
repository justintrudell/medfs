from database.models.base import Base
from sqlalchemy import Column, Boolean
from sqlalchemy.dialects.postgresql import UUID
from uuid import uuid4


class Permission(Base):
    __tablename__ = "permission"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    is_readonly = Column(Boolean, nullable=False)

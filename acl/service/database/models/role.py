from database.models.base import Base
from sqlalchemy import Column, String
from sqlalchemy.dialects.postgresql import UUID
import uuid


class Role(Base):
    __tablename__ = "role"

    id = Column(
        UUID(as_uuid=True), primary_key=True, nullable=False, default=uuid.uuid4
    )
    name = Column(String, nullable=False)

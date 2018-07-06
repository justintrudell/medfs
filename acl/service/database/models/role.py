from database.models.base import Base
from sqlalchemy import Column, String 
from sqlalchemy.dialects.postgresql import UUID


class Role(Base):
    __tablename__ = "role"

    id = Column(UUID(as_uuid=True), primary_key=True, nullable=False)
    name = Column(String, nullable=False)

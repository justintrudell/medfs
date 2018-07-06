from database.models.base import Base
from sqlalchemy import Column
from sqlalchemy.dialects.postgresql import UUID


class Subject(Base):
    __tablename__ = "subject"

    id = Column(UUID(as_uuid=True), primary_key=True, nullable=False)

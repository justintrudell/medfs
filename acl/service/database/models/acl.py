from database.models.base import Base
from database.models.permission import Permission
from sqlalchemy import Column, ForeignKey
from sqlalchemy.dialects.postgresql import UUID


class Acl(Base):
    __tablename__ = "acl"

    user_id = Column(UUID(as_uuid=True), primary_key=True, nullable=False)
    record_id = Column(UUID(as_uuid=True), primary_key=True, nullable=False)
    permission_id = Column(
        UUID(as_uuid=True), ForeignKey(Permission.id), nullable=False
    )

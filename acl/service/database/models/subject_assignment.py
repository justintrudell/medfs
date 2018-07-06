from database.models.base import Base
from database.models.role import Role
from database.models.subject import Subject
from sqlalchemy import Column, ForeignKey
from sqlalchemy.dialects.postgresql import UUID


# Many-to-many relationship between subject and role
class SubjectAssignment(Base):
    __tablename__ = "subject_assignment"

    subject_id = Column(
        UUID(as_uuid=True), ForeignKey(Subject.id), primary_key=True, nullable=False
    )
    role_id = Column(
        UUID(as_uuid=True), ForeignKey(Role.id), primary_key=True, nullable=False
    )

from concurrent import futures
import time
from uuid import UUID
from contextlib import contextmanager

from database.database import db
from database.models.base import Base
from database.models.acl import Acl
from database.models.permission import Permission
from sqlalchemy.orm import sessionmaker
from sqlalchemy.exc import InvalidRequestError

import grpc
import acl_pb2
import acl_pb2_grpc

_ONE_DAY_IN_SECONDS = 60 * 60 * 24
Session = sessionmaker(db)


# To be implemented
class AclServicer(acl_pb2_grpc.AclServicer):
    def __init__(self):
        base = Base()
        base.metadata.create_all(db)
        self._create_permissions_if_not_exist()

    def _create_permissions_if_not_exist(self):
        with session_scope() as session:
            if (
                not session.query(Permission)
                .filter(Permission.is_readonly == True)
                .one_or_none()
            ):  # noqa
                readonly_perm = Permission(is_readonly=True)
                session.add(readonly_perm)
            if (
                not session.query(Permission)
                .filter(Permission.is_readonly == False)
                .one_or_none()
            ):  # noqa
                readwrite_perm = Permission(is_readonly=False)
                session.add(readwrite_perm)

    def _has_read_permissions(self, user_id: str, record_id: str) -> bool:
        with session_scope() as session:
            permission_exists = (
                session.query(Acl).get((UUID(user_id), UUID(record_id))) is not None
            )
        return permission_exists

    def _has_write_permissions(self, user_id: str, record_id: str) -> bool:
        with session_scope() as session:
            permission_exists = (
                session.query(Acl)
                .join(Permission)
                .filter(Acl.user_id == UUID(user_id))
                .filter(Acl.record_id == UUID(record_id))
                .filter(Permission.is_readonly == False)  # noqa
                .one_or_none()
                is not None
            )
        return permission_exists

    def IsPermissionedForRead(self, request, context):
        permission_exists = self._has_read_permissions(
            request.user.id, request.record.id
        )
        return acl_pb2.PermissionResponse(result=permission_exists)

    def IsPermissionedForWrite(self, request, context):
        permission_exists = self._has_write_permissions(
            request.user.id, request.record.id
        )
        return acl_pb2.PermissionResponse(result=permission_exists)

    def SetPermissionsForFile(self, request, context):
        if not self._has_write_permissions(request.grantor.id, request.record.id):
            return acl_pb2.PermissionResponse(result=False)
        with session_scope() as session:
            readonly_perm = (
                session.query(Permission)
                .filter(Permission.is_readonly == True)  # noqa
                .one_or_none()
            )
            write_perm = (
                session.query(Permission)
                .filter(Permission.is_readonly == False)
                .one_or_none()
            )  # noqa
            if not readonly_perm or not write_perm:
                # means our permissions db isn't initialized so idk
                return acl_pb2.PermissionResponse(result=False)
            # Delete all permissions associated with this record and repopulate
            session.query(Acl).filter(Acl.record_id == UUID(request.record.id)).delete()
            for entry in request.userPermMap:
                user_perm = (
                    session.query(Acl)
                    .filter(Acl.user_id == UUID(entry.user.id))
                    .filter(Acl.record_id == UUID(request.record.id))
                    .one_or_none()
                )
                permission_to_set = (
                    readonly_perm.id
                    if entry.permission == acl_pb2.UserPermissionEntry.READ
                    else write_perm.id
                )
                user_perm = Acl(
                    user_id=UUID(entry.user.id),
                    record_id=UUID(request.record.id),
                    permission_id=permission_to_set,
                )
                session.add(user_perm)

        return acl_pb2.PermissionResponse(result=True)

    def AddRecord(self, request, context):
        with session_scope() as session:
            # First check that the record we're trying to add doesn't exist
            record = (
                session.query(Acl)
                .filter(Acl.record_id == UUID(request.record.id))
                .first()
            )
            if record:
                return acl_pb2.AddRecordResponse(result=False)
            write_perm = (
                session.query(Permission)
                .filter(Permission.is_readonly == False)
                .one_or_none()
            )  # noqa
            if not write_perm:
                # means our permissions db isn't initialized so idk
                return acl_pb2.AddRecordResponse(result=False)

            # Assign write permissions to the creator
            user_perm = Acl(
                user_id=UUID(request.creator.id),
                record_id=UUID(request.record.id),
                permission_id=write_perm.id,
            )
            session.add(user_perm)

        return acl_pb2.AddRecordResponse(result=True)

    def GetAllRecordsForUser(self, request, context):
        listOfRecords = acl_pb2.ListOfRecords()
        with session_scope() as session:
            records = (
                session.query(Acl, Permission)
                .filter(Acl.permission_id == Permission.id)
                .filter(Acl.user_id == UUID(request.requestor.id))
                .all()
            )
            for record, perm in records:
                new_record = listOfRecords.records.add()
                new_record.record.id = str(record.record_id)
                new_record.permission = (
                    acl_pb2.RecordPermissionEntry.READ
                    if perm.is_readonly
                    else acl_pb2.RecordPermissionEntry.WRITE
                )

        return listOfRecords

    def GetAllUsersForRecord(self, request, context):
        listOfUsers = acl_pb2.ListOfUsers()
        with session_scope() as session:
            users = (
                session.query(Acl, Permission)
                .filter(Acl.permission_id == Permission.id)
                .filter(Acl.record_id == UUID(request.record.id))
                .all()
            )
            for user, perm in users:
                new_user = listOfUsers.users.add()
                new_user.user.id = str(user.user_id)
                new_user.permission = (
                    acl_pb2.UserPermissionEntry.READ
                    if perm.is_readonly
                    else acl_pb2.UserPermissionEntry.WRITE
                )

        return listOfUsers

    def CleanDb(self, request, context):
        Base.metadata.drop_all(bind=db.engine)
        Base.metadata.create_all(bind=db.engine)
        self._create_permissions_if_not_exist()
        return acl_pb2.Empty()

    def FindCommonRecords(self, request, context):
        user_id = request.user.id
        sql = f"""
            SELECT DISTINCT(record_id) FROM acl 
            WHERE record_id IN (
                SELECT record_id FROM acl 
                WHERE user_id = '{user_id}'
            ) AND user_id  != '{user_id}';
        """
        result = []
        with session_scope() as session:
            result = session.execute(sql).all()

        list_of_records = acl_pb2.ListOfRecords()
        for record in result:
            new_record = list_of_records.records.add()
            new_record.record.id = str(record.record_id)
        return result


@contextmanager
def session_scope():
    """Provide a transactional scope around a series of operations."""
    session = Session()
    try:
        yield session
        session.commit()
    except InvalidRequestError:
        session.rollback()
        raise
    finally:
        session.close()


def serve():
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    acl_pb2_grpc.add_AclServicer_to_server(AclServicer(), server)
    server.add_insecure_port("[::]:5002")
    print("Starting acl service")
    server.start()
    try:
        while True:
            time.sleep(_ONE_DAY_IN_SECONDS)
    except KeyboardInterrupt:
        server.stop(0)
        print("Shutting down server")


if __name__ == "__main__":
    serve()

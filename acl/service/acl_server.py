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

    def GrantPermissions(self, request, context):
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
            for recipient in request.recipients:
                user_perm = (
                    session.query(Acl)
                    .filter(Acl.user_id == UUID(recipient.id))
                    .filter(Acl.record_id == UUID(request.record.id))
                    .one_or_none()
                )
                # if permission doesn't exist, create appropriate permission
                if not user_perm:
                    if request.permission == acl_pb2.GrantPermissionsRequest.READ:
                        permission_id = readonly_perm.id
                    elif request.permission == acl_pb2.GrantPermissionsRequest.WRITE:
                        permission_id = write_perm.id
                    new_user_perm = Acl(
                        user_id=UUID(recipient.id),
                        record_id=UUID(request.record.id),
                        permission_id=permission_id,
                    )
                    session.add(new_user_perm)
                elif request.permission == acl_pb2.GrantPermissionsRequest.WRITE:
                    user_perm.permission_id = write_perm.id
        return acl_pb2.PermissionResponse(result=True)

    def RevokePermissions(self, request, context):
        if not self._has_write_permissions(request.grantor.id, request.record.id):
            return acl_pb2.PermissionResponse(result=False)

        with session_scope() as session:
            readonly_perm = (
                session.query(Permission)
                .filter(Permission.is_readonly == True)  # noqa
                .one_or_none()
            )
            if not readonly_perm:
                # means our permissions db isn't initialized so idk
                return acl_pb2.PermissionResponse(result=False)
            for recipient in request.recipients:
                user_perm = (
                    session.query(Acl)
                    .filter(Acl.user_id == UUID(recipient.id))
                    .filter(Acl.record_id == UUID(request.record.id))
                    .one_or_none()
                )
                # if trying to revoke and recipient has no permissions to begin with
                # return True
                if not user_perm:
                    continue
                # change recipient write permission to readonly
                if request.permission == acl_pb2.RevokePermissionsRequest.WRITE:
                    user_perm.permission_id = readonly_perm.id
                # delete recipient permission
                elif request.permission == acl_pb2.RevokePermissionsRequest.READ:
                    session.delete(user_perm)
        return acl_pb2.PermissionResponse(result=True)

    def AddRecord(self, request, context):
        return acl_pb2.AddRecordResponse(result=True)

    def GetAllRecordsForUser(self, request, context):
        listOfRecords = acl_pb2.ListOfRecords()
        listOfRecords.records.add().id = "abc"
        return listOfRecords

    def GetAllUsersForRecord(self, request, context):
        listOfUsers = acl_pb2.ListOfUsers()
        listOfUsers.users.add().id = "abc"
        return listOfUsers


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
    server.add_insecure_port("[::]:5001")
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

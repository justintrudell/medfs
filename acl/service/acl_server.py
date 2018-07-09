from concurrent import futures
import time
from uuid import UUID

from database.database import db
from database.models.base import Base
from database.models.acl import Acl
from database.models.permission import Permission
from sqlalchemy.orm import sessionmaker

import grpc
import acl_pb2
import acl_pb2_grpc

_ONE_DAY_IN_SECONDS = 60 * 60 * 24


# To be implemented
class AclServicer(acl_pb2_grpc.AclServicer):
    def __init__(self):
        self.db = db
        base = Base()
        base.metadata.create_all(db)

    def IsPermissionedForRead(self, request, context):
        user_id = UUID(request.user.id)
        record_id = UUID(request.record.id)
        Session = sessionmaker(self.db)
        session = Session()
        permission_exists = session.query(Acl).get((user_id, record_id)) is not None
        session.close()
        return acl_pb2.PermissionResponse(result=permission_exists)

    def IsPermissionedForWrite(self, request, context):
        user_id = UUID(request.user.id)
        record_id = UUID(request.record.id)
        Session = sessionmaker(self.db)
        session = Session()
        permission_exists = (
            session.query(Acl)
            .join(Permission)
            .filter(Acl.user_id == user_id)
            .filter(Acl.record_id == record_id)
            .filter(Permission.is_readonly == False)  # noqa
            .one_or_none()
            is not None
        )
        session.close()
        return acl_pb2.PermissionResponse(result=permission_exists)

    def ModifyPermission(self, request, context):
        return acl_pb2.ModifyPermissionResponse(result=True)

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

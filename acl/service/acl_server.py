from concurrent import futures
import time

from database.database import db
from sqlalchemy.orm import sessionmaker
from database.models.base import Base
from database.models.role import Role
from database.models.subject import Subject
from database.models.subject_assignment import SubjectAssignment
import uuid

import grpc
import acl_pb2
import acl_pb2_grpc

_ONE_DAY_IN_SECONDS = 60 * 60 * 24


# To be implemented
class AclServicer(acl_pb2_grpc.AclServicer):
    def __init__(self):
        self.db = db

    def IsPermissionedForRead(self, request, context):
        return acl_pb2.PermissionResponse(result=True)

    def IsPermissionedForWrite(self, request, context):
        return acl_pb2.PermissionResponse(result=True)

    def ModifyPermission(self, request, context):
        return acl_pb2.ModifyPermissionResponse(result=True)

    def AddFile(self, request, context):
        return acl_pb2.AddFileResponse(result=True)

    def GetAllFilesForUser(self, request, context):
        listOfFiles = acl_pb2.ListOfFiles()
        listOfFiles.files.append("hello")
        return listOfFiles

    def GetAllUsersForFile(self, request, context):
        listOfUsers = acl_pb2.ListOfUsers()
        listOfUsers.users.add().id = 1337
        return listOfUsers

def init_db():
    Session = sessionmaker(db)
    session = Session()

    base = Base()
    base.metadata.create_all(db)

    # Test insert
    test_subject = Subject(id=uuid.uuid4())
    session.add(test_subject)
    session.commit()

    # Test read
    users = session.query(Subject)
    for user in users:
        print(user.id)

def serve():
    init_db()
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    acl_pb2_grpc.add_AclServicer_to_server(AclServicer(), server)
    server.add_insecure_port("[::]:5001")
    server.start()
    try:
        while True:
            time.sleep(_ONE_DAY_IN_SECONDS)
    except KeyboardInterrupt:
        server.stop(0)
        print("Shutting down server")


if __name__ == "__main__":
    serve()

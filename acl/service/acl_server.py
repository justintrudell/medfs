from concurrent import futures
import time

import grpc

import acl_pb2
import acl_pb2_grpc

_ONE_DAY_IN_SECONDS = 60 * 60 * 24


# To be implemented
class AclServicer(acl_pb2_grpc.AclServicer):
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


def serve():
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

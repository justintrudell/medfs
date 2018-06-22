from concurrent import futures
import time

import grpc

import acl_pb2
import acl_pb2_grpc

_ONE_DAY_IN_SECONDS = 60 * 60 * 24

# To be implemented
class AclServicer(acl_pb2_grpc.AclServicer):
    def __init__(self):
        pass

    def IsPermissionedForRead(self, request, context):
        pass

    def IsPermissionedForWrite(self, request, context):
        pass

    def ModifyPermission(self, request, context):
        pass

    def AddFile(self, request, context):
        pass

    def GetAllFilesForUser(self, request, context):
        pass

    def GetAllUsersForFile(self, request, context):
        pass


def serve():
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    acl_pb2_grpc.add_AclServicer_to_server(AclServicer(), server)
    server.add_insecure_port('[::]:50051')
    server.start()
    try:
        while True:
            time.sleep(_ONE_DAY_IN_SECONDS)
    except KeyboardInterrupt:
        server.stop(0)
        print("Shutting down server")


if __name__ == '__main__':
    serve()

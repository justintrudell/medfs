import grpc

import acl_pb2
import acl_pb2_grpc

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

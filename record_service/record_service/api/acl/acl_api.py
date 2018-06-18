import grpc

from record_service.api.acl import acl_pb2_grpc


def build_client():
    channel = grpc.insecure_channel("SERVER:PORT")
    return acl_pb2_grpc.AclStub(channel)

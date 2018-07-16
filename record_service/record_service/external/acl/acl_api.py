import grpc

from record_service.external.acl import acl_pb2_grpc


def build_client(server: str, port: int):
    channel = grpc.insecure_channel(f"{server}:{port}")
    return acl_pb2_grpc.AclStub(channel)

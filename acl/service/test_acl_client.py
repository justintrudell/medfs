from __future__ import print_function

import grpc

import acl_pb2
import acl_pb2_grpc


def run():
    channel = grpc.insecure_channel("localhost:5001")
    stub = acl_pb2_grpc.AclStub(channel)
    response = stub.IsPermissionedForRead(
        acl_pb2.PermissionRequest(
            user=acl_pb2.UserId(id="d1227778-23dd-4435-a239-a2132bd3d814"),
            record=acl_pb2.RecordId(id="a54eb2bb-6988-4ace-8648-2f816f7291bb"),
        )
    )
    print("Greeter client received: {}".format(response.result))

    response = stub.IsPermissionedForWrite(
        acl_pb2.PermissionRequest(
            user=acl_pb2.UserId(id="d1227778-23dd-4435-a239-a2132bd3d814"),
            record=acl_pb2.RecordId(id="a54eb2bb-6988-4ace-8648-2f816f7291bb"),
        )
    )
    print("Greeter client received: {}".format(response.result))


if __name__ == "__main__":
    run()

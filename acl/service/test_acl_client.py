from __future__ import print_function

import grpc

import acl_pb2
import acl_pb2_grpc


def run():
    channel = grpc.insecure_channel("localhost:5001")
    stub = acl_pb2_grpc.AclStub(channel)
    response = stub.IsPermissionedForRead(
        acl_pb2.PermissionRequest(user=acl_pb2.UserId(id=0), fileId="randomFile.txt")
    )
    print("Greeter client received: {}".format(response.result))

    response = stub.GetAllFilesForUser(
        acl_pb2.GetFilesRequest(
            requestor=acl_pb2.UserId(id=0), permission=acl_pb2.GetUsersRequest.READ
        )
    )
    print("Greeter client received: {}".format(response.files[0]))

    response = stub.GetAllUsersForFile(
        acl_pb2.GetUsersRequest(
            fileId="randomFile.txt", permission=acl_pb2.GetUsersRequest.READ
        )
    )
    print("Greeter client received: {}".format(response.users[0].id))


if __name__ == "__main__":
    run()

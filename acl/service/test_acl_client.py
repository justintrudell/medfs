from __future__ import print_function

from uuid import UUID

from database.database import db
from database.models.acl import Acl
from database.models.permission import Permission
from sqlalchemy.orm import sessionmaker

import grpc

import acl_pb2
import acl_pb2_grpc


def run():
    uid = "d1227778-23dd-4435-a239-a2132bd3d814"
    rid = "a54eb2bb-6988-4ace-8648-2f816f7291bb"
    channel = grpc.insecure_channel("localhost:5001")
    stub = acl_pb2_grpc.AclStub(channel)
    response = stub.IsPermissionedForRead(
        acl_pb2.PermissionRequest(
            user=acl_pb2.UserId(id=uid), record=acl_pb2.RecordId(id=rid)
        )
    )
    print("Greeter client received: {}, expected False".format(response.result))

    Session = sessionmaker(db)
    session = Session()
    test_readonly = Permission(is_readonly=True)
    test_readwrite = Permission(is_readonly=False)
    session.add(test_readonly)
    session.add(test_readwrite)
    session.commit()
    test_acl = Acl(
        user_id=UUID(uid), record_id=UUID(rid), permission_id=test_readonly.id
    )
    session.add(test_acl)
    session.commit()

    response = stub.IsPermissionedForRead(
        acl_pb2.PermissionRequest(
            user=acl_pb2.UserId(id=uid), record=acl_pb2.RecordId(id=rid)
        )
    )
    print("Greeter client received: {}, expected True".format(response.result))

    response = stub.IsPermissionedForWrite(
        acl_pb2.PermissionRequest(
            user=acl_pb2.UserId(id=uid), record=acl_pb2.RecordId(id=rid)
        )
    )
    print("Greeter client received: {}, expected False".format(response.result))

    test_acl.permission_id = test_readwrite.id
    session.commit()

    response = stub.IsPermissionedForWrite(
        acl_pb2.PermissionRequest(
            user=acl_pb2.UserId(id=uid), record=acl_pb2.RecordId(id=rid)
        )
    )
    print("Greeter client received: {}, expected True".format(response.result))

    session.delete(test_acl)
    session.commit()
    session.delete(test_readonly)
    session.delete(test_readwrite)
    session.commit()
    session.close()


if __name__ == "__main__":
    run()

from __future__ import print_function

from uuid import UUID

from database.database import db
from database.models.acl import Acl
from database.models.permission import Permission
from sqlalchemy.orm import sessionmaker

import grpc

import acl_pb2
import acl_pb2_grpc

Session = sessionmaker(db)


def clear_db():
    session = Session()

    # Clear the db before we start
    acls = session.query(Acl)
    for acl in acls:
        session.delete(acl)
    session.commit()

    permissions = session.query(Permission)
    for permission in permissions:
        session.delete(permission)
    session.commit()
    session.close()


def run():
    clear_db()

    uid = "d1227778-23dd-4435-a239-a2132bd3d814"
    rid = "a54eb2bb-6988-4ace-8648-2f816f7291bb"
    channel = grpc.insecure_channel("localhost:5002")
    stub = acl_pb2_grpc.AclStub(channel)
    response = stub.IsPermissionedForRead(
        acl_pb2.PermissionRequest(
            user=acl_pb2.UserId(id=uid), record=acl_pb2.RecordId(id=rid)
        )
    )
    print("Greeter client received: {}, expected False".format(response.result))

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

    request = acl_pb2.SetPermissionsForFileRequest(
        grantor=acl_pb2.UserId(id=uid), record=acl_pb2.RecordId(id=rid)
    )
    recipient_uid = "72baaa21-0d1b-4408-8576-6c4b23dc59ca"
    del request.userPermMap[:]
    request.userPermMap.extend(
        [
            acl_pb2.UserPermissionEntry(
                user=acl_pb2.UserId(id=uid),
                permission=acl_pb2.UserPermissionEntry.WRITE,
            ),
            acl_pb2.UserPermissionEntry(
                user=acl_pb2.UserId(id=recipient_uid),
                permission=acl_pb2.UserPermissionEntry.READ,
            ),
        ]
    )
    response = stub.SetPermissionsForFile(request)
    print("Greeter client received: {}, expected True".format(response.result))

    response = stub.IsPermissionedForRead(
        acl_pb2.PermissionRequest(
            user=acl_pb2.UserId(id=recipient_uid), record=acl_pb2.RecordId(id=rid)
        )
    )
    print("Greeter client received: {}, expected True".format(response.result))

    response = stub.IsPermissionedForWrite(
        acl_pb2.PermissionRequest(
            user=acl_pb2.UserId(id=recipient_uid), record=acl_pb2.RecordId(id=rid)
        )
    )
    print("Greeter client received: {}, expected False".format(response.result))

    request = acl_pb2.SetPermissionsForFileRequest(
        grantor=acl_pb2.UserId(id=uid), record=acl_pb2.RecordId(id=rid)
    )
    del request.userPermMap[:]
    request.userPermMap.extend(
        [
            acl_pb2.UserPermissionEntry(
                user=acl_pb2.UserId(id=uid),
                permission=acl_pb2.UserPermissionEntry.WRITE,
            ),
            acl_pb2.UserPermissionEntry(
                user=acl_pb2.UserId(id=recipient_uid),
                permission=acl_pb2.UserPermissionEntry.WRITE,
            ),
        ]
    )
    response = stub.SetPermissionsForFile(request)
    print("Greeter client received: {}, expected True".format(response.result))

    response = stub.IsPermissionedForWrite(
        acl_pb2.PermissionRequest(
            user=acl_pb2.UserId(id=recipient_uid), record=acl_pb2.RecordId(id=rid)
        )
    )
    print("Greeter client received: {}, expected True".format(response.result))

    session.close()

    clear_db()


if __name__ == "__main__":
    run()

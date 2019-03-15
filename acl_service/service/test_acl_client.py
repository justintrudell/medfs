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


# Cleans out any permissions
def clear_db():
    session = Session()

    # Clear the db before we start
    acls = session.query(Acl)
    for acl in acls:
        session.delete(acl)
    session.commit()
    session.close()


def get_test_params():
    uid = "d1227778-23dd-4435-a239-a2132bd3d814"
    rid = "a54eb2bb-6988-4ace-8648-2f816f7291bb"
    channel = grpc.insecure_channel("localhost:5002")
    stub = acl_pb2_grpc.AclStub(channel)
    return (uid, rid, channel, stub)


def test_read_permission():
    clear_db()
    uid, rid, channel, stub = get_test_params()
    response = stub.IsPermissionedForRead(
        acl_pb2.PermissionRequest(
            user=acl_pb2.UserId(id=uid), record=acl_pb2.RecordId(id=rid)
        )
    )
    print("1. test_read_permission recieved {}, expected False".format(response.result))

    session = Session()
    test_readonly = (
        session.query(Permission).filter(Permission.is_readonly == True).one()
    )  # noqa
    test_acl = Acl(
        user_id=UUID(uid), record_id=UUID(rid), permission_id=test_readonly.id
    )
    session.add(test_acl)
    session.commit()
    session.close()

    response = stub.IsPermissionedForRead(
        acl_pb2.PermissionRequest(
            user=acl_pb2.UserId(id=uid), record=acl_pb2.RecordId(id=rid)
        )
    )
    print("2. test_read_permission received: {}, expected True".format(response.result))
    clear_db()


def test_write_permission():
    clear_db()
    uid, rid, channel, stub = get_test_params()
    response = stub.IsPermissionedForWrite(
        acl_pb2.PermissionRequest(
            user=acl_pb2.UserId(id=uid), record=acl_pb2.RecordId(id=rid)
        )
    )
    print(
        "1. test_write_permission received: {}, expected False".format(response.result)
    )

    session = Session()
    test_readwrite = (
        session.query(Permission).filter(Permission.is_readonly == False).one()
    )  # noqa
    test_acl = Acl(
        user_id=UUID(uid), record_id=UUID(rid), permission_id=test_readwrite.id
    )
    session.add(test_acl)
    session.commit()
    session.close()

    response = stub.IsPermissionedForWrite(
        acl_pb2.PermissionRequest(
            user=acl_pb2.UserId(id=uid), record=acl_pb2.RecordId(id=rid)
        )
    )
    print(
        "2. test_write_permission received: {}, expected True".format(response.result)
    )
    clear_db()


def test_set_permission():
    clear_db()
    uid, rid, channel, stub = get_test_params()
    recipient_uid = "72baaa21-0d1b-4408-8576-6c4b23dc59ca"

    session = Session()
    test_readwrite = (
        session.query(Permission).filter(Permission.is_readonly == False).one()
    )  # noqa
    test_acl = Acl(
        user_id=UUID(uid), record_id=UUID(rid), permission_id=test_readwrite.id
    )
    session.add(test_acl)
    session.commit()
    session.close()

    response = stub.IsPermissionedForRead(
        acl_pb2.PermissionRequest(
            user=acl_pb2.UserId(id=recipient_uid), record=acl_pb2.RecordId(id=rid)
        )
    )
    print("1. test_set_permission received: {}, expected False".format(response.result))

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
                permission=acl_pb2.UserPermissionEntry.READ,
            ),
        ]
    )

    response = stub.SetPermissionsForFile(request)
    print("2. test_set_permission received: {}, expected True".format(response.result))

    response = stub.IsPermissionedForWrite(
        acl_pb2.PermissionRequest(
            user=acl_pb2.UserId(id=recipient_uid), record=acl_pb2.RecordId(id=rid)
        )
    )
    print("3. test_set_permission received: {}, expected False".format(response.result))

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
    print("4. test_set_permission received: {}, expected True".format(response.result))

    response = stub.IsPermissionedForWrite(
        acl_pb2.PermissionRequest(
            user=acl_pb2.UserId(id=recipient_uid), record=acl_pb2.RecordId(id=rid)
        )
    )
    print("5. test_set_permission received: {}, expected True".format(response.result))
    clear_db()


def test_add_record():
    clear_db()
    uid, rid, channel, stub = get_test_params()
    request = acl_pb2.AddRecordRequest(
        creator=acl_pb2.UserId(id=uid), record=acl_pb2.RecordId(id=rid)
    )
    response = stub.AddRecord(request)
    print("1. test_add_record received: {}, expected True".format(response.result))

    response = stub.IsPermissionedForWrite(
        acl_pb2.PermissionRequest(
            user=acl_pb2.UserId(id=uid), record=acl_pb2.RecordId(id=rid)
        )
    )
    print("2. test_add_record received: {}, expected True".format(response.result))
    clear_db()


def test_get_all_records_for_user():
    clear_db()
    uid, rid, channel, stub = get_test_params()
    rid2 = "72baaa21-0d1b-4408-8576-6c4b23dc59ca"

    session = Session()
    test_readonly = (
        session.query(Permission).filter(Permission.is_readonly == True).one()
    )  # noqa
    test_readwrite = (
        session.query(Permission).filter(Permission.is_readonly == False).one()
    )  # noqa
    test_acl = Acl(
        user_id=UUID(uid), record_id=UUID(rid), permission_id=test_readonly.id
    )
    test_acl2 = Acl(
        user_id=UUID(uid), record_id=UUID(rid2), permission_id=test_readwrite.id
    )
    session.add(test_acl)
    session.add(test_acl2)
    session.commit()
    session.close()

    request = acl_pb2.GetRecordsRequest(requestor=acl_pb2.UserId(id=uid))
    response = stub.GetAllRecordsForUser(request)
    expected = [(rid, "READ"), (rid2, "WRITE")]
    print(
        "1. test_get_all_records_for_user received: {}, expected {}".format(
            response.records, expected
        )
    )

    clear_db()


def test_get_all_users_for_record():
    clear_db()
    uid, rid, channel, stub = get_test_params()
    uid2 = "72baaa21-0d1b-4408-8576-6c4b23dc59ca"

    session = Session()
    test_readonly = (
        session.query(Permission).filter(Permission.is_readonly == True).one()
    )  # noqa
    test_readwrite = (
        session.query(Permission).filter(Permission.is_readonly == False).one()
    )  # noqa
    test_acl = Acl(
        user_id=UUID(uid), record_id=UUID(rid), permission_id=test_readonly.id
    )
    test_acl2 = Acl(
        user_id=UUID(uid2), record_id=UUID(rid), permission_id=test_readwrite.id
    )
    session.add(test_acl)
    session.add(test_acl2)
    session.commit()
    session.close()

    request = acl_pb2.GetUsersRequest(record=acl_pb2.RecordId(id=rid))
    response = stub.GetAllUsersForRecord(request)
    expected = [(uid, "READ"), (uid2, "WRITE")]
    print(
        "1. test_get_all_users_for_record received: {}, expected {}".format(
            response.users, expected
        )
    )

    clear_db()


def test_find_common_records():
    clear_db()
    uid, rid, channel, stub = get_test_params()
    uid2 = "72baaa21-0d1b-4408-8576-6c4b23dc59ca"
    session = Session()
    test_acl1 = Acl(
        user_id=UUID(uid), record_id=UUID(rid), permission_id=test_readonly.id
    )
    test_acl2 = Acl(
        user_id=UUID(uid2), record_id=UUID(rid), permission_id=test_readonly.id
    )
    session.add(test_acl)
    session.add(test_acl2)
    session.commit()
    session.close()
    request = acl_pb2.FindCommonRecordsRequest(user=acl_pb2.UserId(uid))
    response = stub.FindCommonRecords(request)
    print(response)


def run():
    # test_read_permission()
    # test_write_permission()
    # test_set_permission()
    # test_add_record()
    # test_get_all_records_for_user()
    # test_get_all_users_for_record()
    test_find_common_records()


if __name__ == "__main__":
    run()

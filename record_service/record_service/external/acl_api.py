import grpc
from typing import Dict, List
import uuid

from record_service.external import acl_pb2, acl_pb2_grpc as acl_func


def build_client(server: str, port: int):
    channel = grpc.insecure_channel(f"{server}:{port}")
    return acl_func.AclStub(channel)


def add_record(
    client: acl_func.AclStub, user_uuid: str, record_uuid: str
) -> acl_pb2.AddRecordResponse:
    request = acl_pb2.AddRecordRequest(
        creator=_user_id(user_uuid), record=_record_id(record_uuid)
    )
    return client.AddRecord(request)


def set_permissions(
    client: acl_func.AclStub,
    user_uuid: str,
    record_uuid: str,
    permissions: Dict[str, str],
) -> acl_pb2.PermissionResponse:
    acl_permissions = [
        acl_pb2.UserPermissionEntry(
            user=_user_id(user_uuid), permission=_str_to_user_perm(perm)
        )
        for user_uuid, perm in permissions.items()
    ]
    req = acl_pb2.SetPermissionsForFileRequest(
        grantor=_user_id(user_uuid),
        record=_record_id(record_uuid),
        userPermMap=acl_permissions,
    )
    return client.SetPermissionsForFile(req)


def _record_perm_to_string(perm_entry: acl_pb2.RecordPermissionEntry) -> str:
    if perm_entry.permission == acl_pb2.RecordPermissionEntry.READ:
        return "READ"
    elif perm_entry.permission == acl_pb2.RecordPermissionEntry.WRITE:
        return "WRITE"
    else:
        return "UNKNOWN"


def is_user_permissioned_for_read(
    client: acl_func.AclStub, user_uuid: str, record_uuid: str
) -> bool:
    request = acl_pb2.PermissionRequest(
        user=_user_id(user_uuid), record=_record_id(record_uuid)
    )
    response = client.IsPermissionedForRead(request)
    return response.result


def is_user_permissioned_for_write(
    client: acl_func.AclStub, user_uuid: str, record_uuid: str
) -> bool:
    request = acl_pb2.PermissionRequest(
        user=_user_id(user_uuid), record=_record_id(record_uuid)
    )
    response = client.IsPermissionedForWrite(request)
    return response.result


# Return dict maps user_id (str) to permission (str)
# eg. {
#   "<some_uuid>": "READ",
#   "<some_other_uuid>": "WRITE"
# }
def get_records_for_user(client: acl_func.AclStub, user_uuid: str) -> Dict[str, str]:
    request = acl_pb2.GetRecordsRequest(requestor=_user_id(user_uuid))
    response = client.GetAllRecordsForUser(request)
    ret = {}
    for entry in response.records:
        ret[entry.record.id] = _record_perm_to_string(entry)

    return ret


def get_users_for_record(
    client: acl_func.AclStub, record_uuid: str
) -> acl_pb2.ListOfUsers:
    req = acl_pb2.GetUsersRequest(record=_record_id(record_uuid))
    response = client.GetAllUsersForRecord(req)
    return [(entry.user.id, _user_perm_to_string(entry)) for entry in response.users]


def find_common_records(
    client: acl_func.AclStub, user_uuid: str
) -> acl_pb2.FindCommonRecordsResponse:
    req = acl_pb2.FindCommonRecordsRequest(user=acl_pb2.UserId(id=user_uuid))
    return client.FindCommonRecords(req)


def _user_id(user_uuid: str) -> acl_pb2.UserId:
    if isinstance(user_uuid, uuid.UUID):
        user_uuid = str(user_uuid)
    return acl_pb2.UserId(id=user_uuid)


def _record_id(record_uuid: str) -> acl_pb2.RecordId:
    if isinstance(record_uuid, uuid.UUID):
        record_uuid = str(record_uuid)
    return acl_pb2.RecordId(id=record_uuid)


def _str_to_user_perm(perm_str: str) -> acl_pb2.UserPermissionEntry:
    upper_str = perm_str.upper()
    try:
        return getattr(acl_pb2.UserPermissionEntry, upper_str)
    except AttributeError:
        print("FAILED STR TO PERM")


def _user_perm_to_string(perm_entry: acl_pb2.UserPermissionEntry) -> str:
    if perm_entry.permission == acl_pb2.UserPermissionEntry.READ:
        return "READ"
    elif perm_entry.permission == acl_pb2.UserPermissionEntry.WRITE:
        return "WRITE"
    else:
        return "UNKNOWN"

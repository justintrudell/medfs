import grpc
from typing import Dict
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
            user=_user_id(user_uuid), permission=_str_to_perm(perm)
        )
        for user_uuid, perm in permissions.items()
    ]
    req = acl_pb2.SetPermissionsForFileRequest(
        grantor=_user_id(user_uuid),
        record=_record_id(record_uuid),
        userPermMap=acl_permissions,
    )
    return client.SetPermissionsForFile(req)


def _user_id(user_uuid: str) -> acl_pb2.UserId:
    if isinstance(user_uuid, uuid.UUID):
        user_uuid = str(user_uuid)
    return acl_pb2.UserId(id=user_uuid)


def _record_id(record_uuid: str) -> acl_pb2.RecordId:
    if isinstance(record_uuid, uuid.UUID):
        record_uuid = str(record_uuid)
    return acl_pb2.RecordId(id=record_uuid)


def _str_to_perm(perm_str: str) -> acl_pb2.UserPermissionEntry:
    upper_str = perm_str.upper()
    try:
        return getattr(acl_pb2.UserPermissionEntry, upper_str)
    except AttributeError:
        print("FAILED STR TO PERM")

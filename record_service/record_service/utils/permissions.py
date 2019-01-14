from typing import Dict, List, Optional
from flask_sqlalchemy import SQLAlchemy

from record_service.external.acl_pb2_grpc import AclStub
from record_service.external import acl_api
from record_service.models.user import User
from record_service.utils.exceptions import (
    PermissionModificationError,
    UserNotFoundError,
)

import config

PermissionsDict = Dict[str, Dict[str, str]]
UploadRequest = List[PermissionsDict]


def parse_uploaded_permissions(
    permissions_json: UploadRequest, db: SQLAlchemy
) -> PermissionsDict:
    permissions_dict = {dct["email"]: dct["values"] for dct in permissions_json}
    permissions_with_uuid = {}
    for email, values in permissions_dict.items():
        user_obj = db.session.query(User).filter_by(email=email).one_or_none()
        if user_obj is None:
            raise UserNotFoundError(f"User {email} does not exist.")
        permissions_with_uuid[str(user_obj.id)] = values
    return permissions_with_uuid


def create_acl_permissions(
    user_id: str,
    record_uuid: str,
    permissions_dict: PermissionsDict,
    acl_client: Optional[AclStub] = None,
):
    if acl_client is None:
        acl_client = acl_api.build_client(config.ACL_URL, config.ACL_PORT)

    ret = acl_api.add_record(acl_client, user_id, record_uuid)
    if not ret.result:
        raise PermissionModificationError("Failed to add record")

    set_permissions(user_id, record_uuid, permissions_dict, acl_client)


def set_permissions(
    user_id: str,
    record_uuid: str,
    permissions_dict: PermissionsDict,
    acl_client: Optional[AclStub] = None,
):
    if acl_client is None:
        acl_client = acl_api.build_client(config.ACL_URL, config.ACL_PORT)

    permissions = {key: dct["permission"] for key, dct in permissions_dict.items()}
    # Since _create_acl_permissions needs a "state of the world",
    # we have to add ourselves to this state of the world
    permissions[user_id] = "WRITE"
    ret = acl_api.set_permissions(
        acl_client, user_id, record_uuid, permissions
    )
    if not ret.result:
        raise PermissionModificationError("Failed to modify permissions on record")

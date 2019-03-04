import * as recordService from "./record_service";
import { ERR_NOT_AUTHORIZED } from "../models/errors";
import {
  Permission,
  PermissionType,
  PermissionRequest
} from "../models/permissions";

type PermissionServiceResponse = {
  userEmail: string;
  permissionType: string;
};

function normalizePermission(response: PermissionServiceResponse): Permission {
  return {
    ...response,
    permissionType: response.permissionType as PermissionType
  };
}

export function getUsersForRecord(id: string): Promise<Permission[]> {
  return recordService
    .get(`/permissions/${id}`, { json: true })
    .then(response => {
      if (response.statusCode === 200) {
        const permissions = response.body.data as PermissionServiceResponse[];
        return permissions.map(item => normalizePermission(item));
      }

      if (response.statusCode === 401) {
        throw new Error(ERR_NOT_AUTHORIZED);
      }
      throw new Error(`Unknown error: ${response.body}`);
    });
}

export function updatePermissions(
  permissionRequest: PermissionRequest[],
  recordId: string
): recordService.RecordServiceResponse {
  const data = {
    permissions: permissionRequest
  };
  return recordService.post(`/permissions/${recordId}`, data).then(response => {
    if (response.statusCode === 200) {
      return response;
    }
    if (response.statusCode === 401) {
      throw new Error(ERR_NOT_AUTHORIZED);
    }
    throw new Error(`Unknown error: ${response.body}`);
  });
}

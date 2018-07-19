import * as recordService from "./record_service";
import { PermissionRequest } from "../models/permissions";
import * as fs from "fs";

export function getAllForUser(): recordService.RecordServiceResponse {
  return recordService.get(`/records`);
}

export function get(id: string): recordService.RecordServiceResponse {
  return recordService.get(`/records/${id}`, { json: true });
}

export function uploadFile(
  permissions: PermissionRequest[],
  extension: string,
  file: File
): recordService.RecordServiceResponse {
  const form = {
    permissions: JSON.stringify(permissions),
    extension,
    file: fs.createReadStream(file.path)
  };
  return recordService.post("/records", form, {}, "formData");
}

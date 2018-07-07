import * as recordService from "./record_service";

export function getAllForUser(): recordService.RecordServiceResponse {
  return recordService.get(`/records`);
}

export function get(id: string): recordService.RecordServiceResponse {
  return recordService.get(`/records/${id}`, { json: true });
}

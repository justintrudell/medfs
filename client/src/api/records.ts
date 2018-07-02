import * as recordService from "./record_service";

export function getAllForUser(userId: string): recordService.RecordServiceResponse {
  return recordService.get(`/records`);
}

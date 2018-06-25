import * as recordService from "./record_service";

export function login(
  username: string,
  password: string
): recordService.RecordServiceResponse {
  const data = { username, password };
  return recordService.post(`/login`, data);
}

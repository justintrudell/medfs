import * as recordService from "./record_service";

export function login(
  username: string,
  password: string
): recordService.RecordServiceResponse {
  const data = { username, password, remember_me: true };
  return recordService.post(`/login`, data);
}

export function logout(): recordService.RecordServiceResponse {
  return recordService.post(`logout`, {});
}

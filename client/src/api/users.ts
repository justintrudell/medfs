import * as recordService from "./record_service";

export function getUser(userId: number): recordService.RecordServiceResponse {
  return recordService.get(`/users/${userId}`);
}

export function createUser(
  username: string,
  password: string
): recordService.RecordServiceResponse {
  const data = { username, password };
  return recordService.post(`/users/create`, data);
}

export function testEndpoint(): recordService.RecordServiceResponse {
  return recordService.get(`/users/test`);
}

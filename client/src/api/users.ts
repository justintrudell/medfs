import * as recordService from "./record_service";

export function getUser(userId: number): recordService.MiddlewareResponse {
  return recordService.get(`/users/${userId}`);
}

export function createUser(
  username: string,
  password: string
): recordService.MiddlewareResponse {
  const data = { username, password };
  return recordService.post(`/users/create`, data);
}

export function testEndpoint(): recordService.MiddlewareResponse {
  return recordService.get(`/users/test`);
}

const recordService = require("./record_service");

export function getUser(userId: number, callback: any) {
    return recordService.get(`/users/${userId}`, callback);
}

export function createUser(username: string, password: string, callback: any) {
    const data = { username, password };
    return recordService.post(`/users/create`, data, callback);
}

export function testEndpoint(callback: any) {
    return recordService.get(`/users/test`, callback);
}

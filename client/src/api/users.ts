const recordService = require("./record_service");

export function getUser(userId: number) {
    return recordService.get(`/users/${userId}`);
}

export function createUser(username: string, password: string, callback: any) {
    const data = { username, password };
    return recordService.post(`/users/create`, data, callback);
}

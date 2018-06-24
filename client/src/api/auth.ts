const recordService = require("./record_service");

export function login(username: string, password: string, callback: any) {
    const data = { username, password };
    return recordService.post(`/login`, data, callback);
}

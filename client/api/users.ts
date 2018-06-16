const recordService = require("./record_service");

export function getUser(userId: number) {
return recordService.get(`/users/${userId}`);
}

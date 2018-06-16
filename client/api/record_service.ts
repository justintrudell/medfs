let request = require("request");
let config = require("../config");
let url = require("url");

export function get(endpoint: string, callback: Function) {
    const fullPath = url.resolve(config.constants.RECORD_SERVICE_ENDPOINT, endpoint);
    request(fullPath.toString(), callback);
}

export function post(endpoint: string, data: any, callback: Function) {
    // TODO
}

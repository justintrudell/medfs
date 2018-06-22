import * as request from "request";
import { constants } from "../config";
import { resolve } from "url";

export function get(endpoint: string, callback: Function) {
    const fullPath = resolve(constants.RECORD_SERVICE_ENDPOINT, endpoint);
    // @ts-ignore: Requests typeshed has some issues around this
    request(fullPath.toString(), callback);
}

export function post(endpoint: string, data: any, callback: Function) {
    // TODO
}

import * as requestMaster from "request";
import { constants } from "../config";
import { resolve } from "url";

const request = requestMaster.defaults({ jar: true });

export function get(endpoint: string, callback: any) {
    const fullPath = resolve(constants.RECORD_SERVICE_ENDPOINT, endpoint);
    // @ts-ignore: Requests typeshed has some issues around this
    request(fullPath.toString(), callback);
}

export function post(endpoint: string, data: any, callback: requestMaster.RequestCallback): void {
    const fullPath = resolve(constants.RECORD_SERVICE_ENDPOINT, endpoint);
    request.post({
        url: fullPath,
        json: data
    }, callback);
}

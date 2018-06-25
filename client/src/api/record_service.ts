import * as requestMaster from "request";
import { constants } from "../config";
import { resolve } from "url";

export type RecordServiceResponse = Promise<requestMaster.Response>;
const request = requestMaster.defaults({ jar: true });

export function get(endpoint: string): RecordServiceResponse {
  return new Promise((pResolve, pReject) => {
    const fullPath = resolve(constants.RECORD_SERVICE_ENDPOINT, endpoint);
    request(fullPath.toString(), (error, response, _body) => {
      if (error) {
        pReject(error);
        return;
      }
      pResolve(response);
    });
  });
}

export function post(endpoint: string, data: {}): RecordServiceResponse {
  return new Promise((pResolve, pReject) => {
    const fullPath = resolve(constants.RECORD_SERVICE_ENDPOINT, endpoint);
    request.post({ url: fullPath, json: data }, (error, response, _body) => {
      if (error) {
        pReject(error);
        return;
      }
      pResolve(response);
    });
  });
}

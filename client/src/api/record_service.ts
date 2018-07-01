import * as requestMaster from "request";
import { constants } from "../config";
import { resolve } from "url";
const fileCookieStore = require("tough-cookie-filestore");

export type RecordServiceResponse = Promise<requestMaster.Response>;

const jar = requestMaster.jar(new fileCookieStore(constants.COOKIE_STORAGE));
const request = requestMaster.defaults({ jar });

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

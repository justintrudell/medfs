import * as requestMaster from "request";
import { constants } from "../config";
import { resolve } from "url";
const fileCookieStore = require("tough-cookie-file-store");

export type RecordServiceResponse = Promise<requestMaster.Response>;

const jar = requestMaster.jar(new fileCookieStore(constants.COOKIE_STORAGE));
const request = requestMaster.defaults({ jar });

export function get(endpoint: string, options: {} = {}): RecordServiceResponse {
  return new Promise((pResolve, pReject) => {
    const fullPath = resolve(constants.RECORD_SERVICE_ENDPOINT, endpoint);
    const requestOptions = {
      ...options,
      url: fullPath.toString()
    };
    request(requestOptions, (error, response, _body) => {
      if (error) {
        pReject(error);
        return;
      }
      pResolve(response);
    });
  });
}

export function post(
  endpoint: string,
  data: {},
  options: {} = {}
): RecordServiceResponse {
  return new Promise((pResolve, pReject) => {
    const fullPath = resolve(constants.RECORD_SERVICE_ENDPOINT, endpoint);
    const requestOptions = {
      ...options,
      url: fullPath.toString(),
      json: data
    };
    request.post(requestOptions, (error, response, _body) => {
      if (error) {
        pReject(error);
        return;
      }
      pResolve(response);
    });
  });
}

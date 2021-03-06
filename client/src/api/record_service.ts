import * as requestMaster from "request";
import { constants } from "../config";
import { resolve } from "url";
import { MedFsNotification } from "../models/notifications";
import { coerceNotification } from "./users";
const fileCookieStore = require("tough-cookie-file-store");
const newEventSource = require("eventsource");

export type RecordServiceResponse = Promise<requestMaster.Response>;

const cookieStore = new fileCookieStore(constants.COOKIE_STORAGE);
const jar = requestMaster.jar(cookieStore);
const request = requestMaster.defaults({ jar });

export function get(endpoint: string, options: {} = {}): RecordServiceResponse {
  return new Promise((pResolve, pReject) => {
    const fullPath = resolve(constants.record_service_endpoint(), endpoint);
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
  options: {} = {},
  dataKey: keyof requestMaster.Options = "json"
): RecordServiceResponse {
  return new Promise((pResolve, pReject) => {
    const fullPath = resolve(constants.record_service_endpoint(), endpoint);
    const requestOptions = {
      ...options,
      url: fullPath.toString(),
      [dataKey]: data
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

export function del(endpoint: string, options: {} = {}): RecordServiceResponse {
  return new Promise((pResolve, pReject) => {
    const fullPath = resolve(constants.record_service_endpoint(), endpoint);
    const requestOptions = {
      ...options,
      url: fullPath.toString()
    };
    request.delete(requestOptions, (error, response, _body) => {
      if (error) {
        pReject(error);
        return;
      }
      pResolve(response);
    });
  });
}

export function stream(
  endpoint: string,
  uuid: string,
  notifyFunction: (notification?: MedFsNotification) => void
): EventSource {
  const sessionCookie =
    cookieStore.idx[constants.message_cookie_endpoint()]["/"]["session"];
  const sessionCookieStr = sessionCookie.key + "=" + sessionCookie.value;
  const rememberCookie =
    cookieStore.idx[constants.message_cookie_endpoint()]["/"]["remember_token"];
  const rememberCookieStr = rememberCookie.key + "=" + rememberCookie.value;

  const eventSourceInitDict = {
    headers: { Cookie: [sessionCookieStr, rememberCookieStr] }
  };
  const evtSource = new newEventSource(
    resolve(constants.message_service_endpoint(), endpoint + uuid),
    eventSourceInitDict
  );
  evtSource.onmessage = (e: { data: string }) => {
    notifyFunction(coerceNotification(JSON.parse(e.data)));
  };
  return evtSource;
}

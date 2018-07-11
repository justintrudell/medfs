import * as requestMaster from "request";
import { constants } from "../config";
import { resolve } from "url";
const fileCookieStore = require("tough-cookie-file-store");
const newEventSource = require("eventsource");

export type RecordServiceResponse = Promise<requestMaster.Response>;

const cookieStore = new fileCookieStore(constants.COOKIE_STORAGE);
const jar = requestMaster.jar(cookieStore);
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

export function stream(endpoint: string, uuid: string): EventSource {
  const sessionCookie = cookieStore.idx.localhost["/"]["session"];
  const sessionCookieStr = sessionCookie.key + "=" + sessionCookie.value;
  var rememberCookie = cookieStore.idx.localhost["/"]["remember_token"];
  const rememberCookieStr = rememberCookie.key + "=" + rememberCookie.value;

  var eventSourceInitDict = {
    headers: { Cookie: [sessionCookieStr, rememberCookieStr] }
  };
  var evtSource = new newEventSource(
    constants.RECORD_SERVICE_ENDPOINT + endpoint + uuid,
    eventSourceInitDict
  );
  evtSource.onmessage = function(e: any) {
    // TODO: Handle incoming messages
    console.log("Received message: " + e.data);
  };
  return evtSource;
}

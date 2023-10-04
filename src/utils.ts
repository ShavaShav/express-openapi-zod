import {
  RequestBodyOrSchema,
  ResponseConfigOrSchema,
  ExtendedRequestBody,
  ExtendedResponseConfig,
  ZodSchema,
  ZodTypeTuple,
} from "./types";
import { z } from "zod";

// Converts args to a tuple
export const tuple = <T extends any[]>(...args: T): T => {
  return args;
};

export const isTuple = <T>(schema: ZodSchema<T>): schema is ZodTypeTuple<T> =>
  // @ts-ignore
  "length" in schema && !schema._def;

export const isResponseContentType = <ResponseType>(
  response: ResponseConfigOrSchema<ResponseType>
): response is ExtendedResponseConfig<ResponseType> => {
  return (
    !!response && !("length" in response) && response.description !== undefined
  );
};

export const isRequestContentType = <RequestType>(
  request: RequestBodyOrSchema<RequestType>
): request is ExtendedRequestBody<RequestType> => {
  return !!request && !(request instanceof z.ZodType);
};

export const getCodeDescription = (code: number | string) => {
  if (code == 100) {
    return "Continue";
  } else if (code == 101) {
    return "Switching Protocols";
  } else if (code == 102) {
    return "Processing";
  } else if (code == 200) {
    return "OK";
  } else if (code == 201) {
    return "Created";
  } else if (code == 202) {
    return "Accepted";
  } else if (code == 203) {
    return "Non-Authoritative Information";
  } else if (code == 204) {
    return "No Content";
  } else if (code == 205) {
    return "Reset Content";
  } else if (code == 206) {
    return "Partial Content";
  } else if (code == 207) {
    return "Multi-Status";
  } else if (code == 208) {
    return "Already Reported";
  } else if (code == 226) {
    return "IM Used";
  } else if (code == 300) {
    return "Multiple Choices";
  } else if (code == 301) {
    return "Moved Permanently";
  } else if (code == 302) {
    return "Found";
  } else if (code == 303) {
    return "See Other";
  } else if (code == 304) {
    return "Not Modified";
  } else if (code == 305) {
    return "Use Proxy";
  } else if (code == 307) {
    return "Temporary Redirect";
  } else if (code == 308) {
    return "Permanent Redirect";
  } else if (code == 400) {
    return "Bad Request";
  } else if (code == 401) {
    return "Unauthorized";
  } else if (code == 402) {
    return "Payment Required";
  } else if (code == 403) {
    return "Forbidden";
  } else if (code == 404) {
    return "Not Found";
  } else if (code == 405) {
    return "Method Not Allowed";
  } else if (code == 406) {
    return "Not Acceptable";
  } else if (code == 407) {
    return "Proxy Authentication Required";
  } else if (code == 408) {
    return "Request Timeout";
  } else if (code == 409) {
    return "Conflict";
  } else if (code == 410) {
    return "Gone";
  } else if (code == 411) {
    return "Length Required";
  } else if (code == 412) {
    return "Precondition Failed";
  } else if (code == 413) {
    return "Payload Too Large";
  } else if (code == 414) {
    return "URI Too Long";
  } else if (code == 415) {
    return "Unsupported Media Type";
  } else if (code == 416) {
    return "Range Not Satisfiable";
  } else if (code == 417) {
    return "Expectation Failed";
  } else if (code == 418) {
    return "I'm a teapot";
  } else if (code == 421) {
    return "Misdirected Request";
  } else if (code == 422) {
    return "Unprocessable Entity";
  } else if (code == 423) {
    return "Locked";
  } else if (code == 424) {
    return "Failed Dependency";
  } else if (code == 425) {
    return "Too Early";
  } else if (code == 426) {
    return "Upgrade Required";
  } else if (code == 428) {
    return "Precondition Required";
  } else if (code == 429) {
    return "Too Many Requests";
  } else if (code == 431) {
    return "Request Header Fields Too Large";
  } else if (code == 451) {
    return "Unavailable For Legal Reasons";
  } else if (code == 500) {
    return "Internal Server Error";
  } else if (code == 501) {
    return "Not Implemented";
  } else if (code == 502) {
    return "Bad Gateway";
  } else if (code == 503) {
    return "Service Unavailable";
  } else if (code == 504) {
    return "Gateway Timeout";
  } else if (code == 505) {
    return "HTTP Version Not Supported";
  } else if (code == 506) {
    return "Variant Also Negotiates";
  } else if (code == 507) {
    return "Insufficient Storage";
  } else if (code == 508) {
    return "Loop Detected";
  } else if (code == 510) {
    return "Not Extended";
  } else if (code == 511) {
    return "Network Authentication Required";
  } else {
    return "";
  }
};

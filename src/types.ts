import {
  RouteConfig,
  ResponseConfig,
  ZodRequestBody,
  ZodMediaTypeObject,
  ZodContentObject,
} from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

/**
 * zod-to-openapi overrides to add types to requests/responses
 */
interface TypedZodMediaTypeObject<T> extends ZodMediaTypeObject {
  schema: z.ZodType<T> | ZodMediaTypeObject["schema"];
  // schema: ZodType<unknown> | SchemaObject | ReferenceObject;
}

interface TypedZodContentObject<T> extends ZodContentObject {
  [mediaType: string]: TypedZodMediaTypeObject<T>;
}

interface TypedZodRequestBody<T> extends ZodRequestBody {
  content: TypedZodContentObject<T>;
}

interface TypedResponseConfig<T> extends ResponseConfig {
  content?: TypedZodContentObject<T>;
}

/**
 * additional types
 */

// ZodTypeTuple enables strict unions, which ignore excess property checks which z.union has issues with
// For ex. z.union([z.object({id}), z.object({id,name})]) or  is reduced to type `{id}` since it statisfies both types.
// but if passed as an array literal, we can use this following to infer the proper union type `{id} | {id,name}` for T
export type ZodTypeTuple<T> = readonly [
  z.ZodType<T>,
  z.ZodType<T>,
  ...z.ZodType<T>[]
];

// ZodSchema is either a Zod type or an array of them (as described above)
export type ZodSchema<T> = z.ZodType<T> | ZodTypeTuple<T>;

// Extend the zod-to-openapi response and request bodies with a 'schema' field,
// so clients can bypass having to define a media type explicitly

const A = z.object({ id: z.string() });
const B = z.object({ id: z.string(), name: z.string() });
const AorB = z.union([A, B]);
type AorBType = z.infer<typeof AorB>;

// Allow setting the 'content' OR the 'schema' field, but not both
interface RequestBodyWithSchema<RequestType>
  extends Partial<TypedZodRequestBody<RequestType>> {
  content?: never;
  schema: ZodSchema<RequestType>;
}

interface RequestBodyWithContent<RequestType>
  extends TypedZodRequestBody<RequestType> {
  schema?: never;
}

export type ExtendedRequestBody<RequestType> =
  | RequestBodyWithContent<RequestType>
  | RequestBodyWithSchema<RequestType>;

interface ResponseConfigWithSchema<ResponseType>
  extends TypedResponseConfig<ResponseType> {
  content?: never;
  schema?: ZodSchema<ResponseType>;
}

interface ResponseConfigWithContent<ResponseType>
  extends TypedResponseConfig<ResponseType> {
  schema?: never;
}

export type ExtendedResponseConfig<RequestType> =
  | ResponseConfigWithContent<RequestType>
  | ResponseConfigWithSchema<RequestType>;

// We'll accept the extended zod-to-openapi request/response objects, or just the zod schemas for ease of use
export type RequestBodyOrSchema<T> = ExtendedRequestBody<T> | ZodSchema<T>;
export type ResponseConfigOrSchema<T> =
  | ExtendedResponseConfig<T>
  | ZodSchema<T>;

// Helper types for inferring the union response type from the status->response map
type InferResponseConfigBody<T> = T extends ExtendedResponseConfig<infer U>
  ? T["schema"] extends Array<infer V>
    ? V extends z.ZodType<infer Q>
      ? Q
      : never
    : U
  : never;

export type InferResponseBodyType<T> = T extends Array<infer V>
  ? V extends z.ZodType<infer U>
    ? U
    : InferResponseConfigBody<V>
  : T extends z.ZodType<infer U>
  ? U
  : InferResponseConfigBody<T>;

export type ResponseMap<ResponseType> = Record<
  number,
  ResponseConfigOrSchema<ResponseType> | null
>;

// Full typed zod-to-openapi RouteConfig
export type TypedRouteConfig<
  RequestParams,
  RequestBody,
  ResponseBody,
  RequestQuery
> = Omit<RouteConfig, "method" | "request" | "responses"> & {
  request?: Omit<RouteConfig["request"], "body" | "params" | "query"> & {
    body?: RequestBodyOrSchema<RequestBody>;
    params?: RequestParams;
    query?: RequestQuery;
  };
  responses: ResponseBody;
};

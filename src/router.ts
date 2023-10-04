import {
  RouteConfig,
  ZodContentObject,
  OpenAPIRegistry,
  ResponseConfig,
  ZodRequestBody,
} from "@asteasolutions/zod-to-openapi";
import { RequestHandler, Router } from "express";
import { z } from "zod";

import {
  getCodeDescription,
  isRequestContentType,
  isResponseContentType,
  isTuple,
} from "./utils";
import {
  TypedRouteConfig,
  InferResponseBodyType,
  ResponseMap,
  ZodSchema,
} from "./types";

const getContent = <T>(
  mediaTypes: string[],
  schema?: ZodSchema<T>,
  base: ZodContentObject = {}
) => {
  if (schema) {
    // @ts-ignore
    const normalSchema = isTuple(schema) ? z.union(schema) : schema;
    const mediaTypeMap = mediaTypes.reduce((map, mediaType) => {
      map[mediaType] = { schema: normalSchema };
      return map;
    }, {} as Record<string, { schema: z.ZodType<T, z.ZodTypeDef, T> }>);

    return {
      ...base,
      ...mediaTypeMap,
    };
  }
  return base;
};

const OpenAPIRouter = (
  registry: OpenAPIRegistry,
  router = Router(),
  options = {
    defaultRequestBodyMediaTypes: ["application/json"],
    defaultResponseBodyMediaTypes: ["application/json"],
  }
) => {
  return {
    router: router,
    openapi: <
      RequestParams extends z.AnyZodObject | undefined,
      RequestType,
      ResponseType extends ResponseMap<any>,
      RequestQuery extends z.AnyZodObject | undefined
    >(
      routeConfig: TypedRouteConfig<
        RequestParams,
        RequestType,
        ResponseType,
        RequestQuery
      >
    ) => {
      // Merge simpler `routeConfig.json.responses[*]` into
      // `routeConfig.responses[*].content['application/json'].schema`
      const responses: Record<number, ResponseConfig> = {};
      Object.entries(routeConfig.responses ?? {}).forEach(
        ([code, responseBody]) => {
          const _code = parseInt(code, 10);
          let responseConfig: ResponseConfig = {
            description: getCodeDescription(_code),
          };

          if (responseBody) {
            if (isResponseContentType(responseBody)) {
              const { schema, ...content } = responseBody;
              responseConfig = {
                ...responseConfig,
                ...content,
              };
            }

            if (Object.keys(responseConfig.content ?? {}).length < 1) {
              const schema = isResponseContentType(responseBody)
                ? responseBody.schema
                : responseBody;

              responseConfig.content = getContent(
                options.defaultResponseBodyMediaTypes,
                schema,
                responseConfig.content
              );
            }
          }

          responses[_code] = responseConfig;
        }
      );

      let requestBody = { content: {} } as ZodRequestBody;
      if (routeConfig.request?.body) {
        const requestBefore = routeConfig.request?.body;

        if (isRequestContentType(requestBefore)) {
          const { schema, ...content } = requestBefore;
          requestBody = { content: {}, ...content };
        }

        if (Object.keys(requestBody.content).length < 1) {
          const schema = isRequestContentType(requestBefore)
            ? requestBefore.schema
            : requestBefore;

          requestBody.content = getContent(
            options.defaultRequestBodyMediaTypes,
            schema
          );
        }
      }

      const { body, ...request } = routeConfig.request ?? {};

      const registerFor = (method: RouteConfig["method"]) => {
        registry.registerPath({
          ...routeConfig,
          request: routeConfig.request
            ? {
                ...request,
                ...(routeConfig.request?.body
                  ? { body: requestBody }
                  : undefined),
              }
            : undefined,
          responses,
          method,
        });
      };

      const params = routeConfig.request?.params;
      const query = routeConfig.request?.query;

      type ParamsType = z.infer<NonNullable<typeof params>>;
      type QueryType = z.infer<NonNullable<typeof query>>;
      type ResponseTypes = InferResponseBodyType<
        ResponseType[keyof ResponseType]
      >;

      return {
        delete: (
          path: string,
          ...handlers: RequestHandler<
            ParamsType,
            ResponseTypes,
            RequestType,
            QueryType
          >[]
        ) => {
          registerFor("delete");
          return router.delete(path, handlers);
        },
        get: (
          path: string,
          ...handlers: RequestHandler<
            ParamsType,
            ResponseTypes,
            RequestType,
            QueryType
          >[]
        ) => {
          registerFor("get");
          return router.get(path, handlers);
        },
        patch: (
          path: string,
          ...handlers: RequestHandler<
            ParamsType,
            ResponseTypes,
            RequestType,
            QueryType
          >[]
        ) => {
          registerFor("patch");
          return router.patch(path, handlers);
        },
        post: (
          path: string,
          ...handlers: RequestHandler<
            ParamsType,
            ResponseTypes,
            RequestType,
            QueryType
          >[]
        ) => {
          registerFor("post");
          return router.post(path, handlers);
        },
        put: (
          path: string,
          ...handlers: RequestHandler<
            ParamsType,
            ResponseTypes,
            RequestType,
            QueryType
          >[]
        ) => {
          registerFor("put");
          return router.put(path, handlers);
        },
      };
    },
  };
};

export default OpenAPIRouter;

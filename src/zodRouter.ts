import { z } from "zod";
import { RequestHandler, Router } from "express";
import {
  RouteConfig,
  ZodContentObject,
  OpenAPIRegistry,
} from "@asteasolutions/zod-to-openapi";
import { ParamsDictionary } from "express-serve-static-core";

type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>;

const OpenApiRouter = (router: Router, registry: OpenAPIRegistry) => {
  return {
    ...router,
    openapi: <RequestType, ResponseType>(
      routeConfig: Optional<Omit<RouteConfig, "method">, "responses"> & {
        json?: {
          request: z.ZodObject<any, any, any, RequestType>;
          responses: Record<number, z.ZodObject<any, any, any, ResponseType>>;
        };
      }
    ) => {
      // Merge in simple json responses
      Object.entries(routeConfig.json?.responses ?? {}).forEach(
        ([code, zObject]) => {
          if (!routeConfig.responses) {
            routeConfig.responses = {};
          }
          if (!routeConfig.responses.code) {
            routeConfig.responses[code] = { description: "" };
          }
          if (!routeConfig.responses[code].content) {
            routeConfig.responses[code].content = {} as ZodContentObject;
          }
          routeConfig.responses[code].content = {
            ...(routeConfig.responses[code].content ?? {}),
            ["application/json"]: { schema: zObject },
          };
        }
      );

      if (routeConfig.json?.request) {
        if (!routeConfig.request) {
          routeConfig.request = {};
        }
        if (!routeConfig.request.body) {
          routeConfig.request.body = { content: {} as ZodContentObject };
        }
        routeConfig.request.body.content = {
          ...(routeConfig.request.body.content ?? {}),
          ["application/json"]: { schema: routeConfig.json.request },
        };
      }

      delete routeConfig["json"];

      const registerFor = (method: RouteConfig["method"]) => {
        registry.registerPath({
          responses: {},
          ...routeConfig,
          method,
        });
        // console.log(`${method} ${routeConfig.path} registered`);
      };

      return {
        delete: (
          path: string,
          ...handlers: RequestHandler<
            ParamsDictionary,
            ResponseType,
            RequestType
          >[]
        ) => {
          registerFor("delete");
          return router.delete(path, handlers);
        },
        get: (
          path: string,
          ...handlers: RequestHandler<
            ParamsDictionary,
            ResponseType,
            RequestType
          >[]
        ) => {
          registerFor("get");
          return router.get(path, handlers);
        },
        patch: (
          path: string,
          ...handlers: RequestHandler<
            ParamsDictionary,
            ResponseType,
            RequestType
          >[]
        ) => {
          registerFor("patch");
          return router.patch(path, handlers);
        },
        post: (
          path: string,
          ...handlers: RequestHandler<
            ParamsDictionary,
            ResponseType,
            RequestType
          >[]
        ) => {
          registerFor("post");
          return router.post(path, handlers);
        },
        put: (
          path: string,
          ...handlers: RequestHandler<
            ParamsDictionary,
            ResponseType,
            RequestType
          >[]
        ) => {
          registerFor("put");
          return router.put(path, handlers);
        },
      };
    },
  };
};

export default OpenApiRouter;

import {
  OpenAPIRegistry,
  OpenApiGeneratorV3,
} from "@asteasolutions/zod-to-openapi";
import { registerModels } from "./model";

const registry = new OpenAPIRegistry();

registerModels(registry);

let openApiSpec: any;

export const getOpenAPISpec = () => {
  if (!openApiSpec)
    openApiSpec = new OpenApiGeneratorV3(registry.definitions).generateDocument(
      {
        openapi: "3.0.0",
        info: {
          version: "1.0.0",
          title: "My API",
        },
      }
    );
  return openApiSpec;
};

export { registry };

import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { OpenAPIRouter } from "express-openapi-zod";
import { z } from "./zod";

export const registerModels = (registry: OpenAPIRegistry) => {
  registry.register("registry", ErrorResponse);
  registry.register("registry", User);
  registry.register("registry", Pet);
  registry.register("registry", PetWithOwner);
};

export const User = z.object({
  id: z.string().openapi({ example: "abc123" }),
  name: z.string().openapi({ example: "Henry" }),
});

export const Pet = z.object({
  id: z.string().openapi({ example: "abc123" }),
  name: z.string().openapi({ example: "Mittens" }),
  age: z.optional(z.number()).openapi({ example: 5 }),
  ownerId: z.optional(z.string()).openapi({ example: "Henry" }),
});

export const PetWithOwner = Pet.extend({
  owner: User,
});

export const ErrorResponse = z.object({
  message: z.string().openapi({ example: "Something went wrong!" }),
});

export const ValidationError = ErrorResponse.extend({
  errors: z.array(
    z.object({ path: z.string(), message: z.string(), errorCode: z.string() })
  ),
});

# express-openapi-zod

## Install

```sh
npm install express-openapi-zod @asteasolutions/zod-to-openapi
```

## Contents

- [Purpose](#purpose)
- [Usage](#usage)
  - [Create an `OpenAPIRouter`](#create-an-openapirouter)
  - [Use `openapi()`](#use-openapi)
    - [Example](#example)
- [OpenAPIRouter()](#openapirouter)
  - [Accessing express router](#accessing-express-router)
- [openapi()](#openapi)
  - [Reduced forms](#reduced-forms)
    - [Content media types for reduced forms](#content-media-types-for-reduced-forms)
    - [Gotcha with typed unions](#gotcha-with-typed-unions)

## Purpose

- Generate openapi specification from [express](https://expressjs.com/) routers and [zod](https://github.com/colinhacks/zod) schemas.
  - See the [demo](./demo/) for an example. Can be used for documentation, validation, etc, using tools like:
    - [swagger-ui](https://www.npmjs.com/package/swagger-ui-express)
    - [express-openapi-validator](https://www.npmjs.com/package/express-openapi-validator)
- Add types for express handler `Request` and `Response` objects.

## Usage

Please check out the [`zod-to-openapi` setup](https://github.com/asteasolutions/zod-to-openapi) first. `express-openapi-zod` will automatically [registers the openapi paths](https://github.com/asteasolutions/zod-to-openapi#registering-a-path-or-webhook) based on the express routes, but you must configure the rest of `zod-to-openapi` yourself. See the [demo](./demo/) for a working example.

### Create an `OpenAPIRouter`

Use [`OpenAPIRouter`](#openapirouter) in place of `express.Router`:

```typescript
import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { OpenAPIRouter } from "express-openapi-zod";

const registry = new OpenAPIRegistry();
const router = OpenAPIRouter(registry);
```

### Use `openapi()`

The `openapi` function registers the path for openapi generation, and provides full typing to the `express` `Request` and `Response` objects in the chained `delete`, `get`, `patch`, `post`, and `put` calls.

```typescript
router.openapi({
  /*zod-to-openapi registerPath config*/
}).get("/", (req, res) => {
  /*`req` and `res` are fully typed*/
}).
```

Then, [generate the openapi specification](https://github.com/asteasolutions/zod-to-openapi#the-generator) using zod-to-openapi.

#### Example

```typescript
router
  .openapi({
    path: "/pets",
    description: "Get all pets"
    request: {
      query: z.object({
        color: z.optional(z.string()).openapi({ description: 'Get only pets with this color', example: "grey" }),
      }),
    },
    responses: {
      200: {
        description: "OK",
        content: {
          "application/json": {
            schema: z.array(
              z.object({
                name: z.string().openapi({ example: "Mittens" }),
                color: z.string().openapi({ example: "black" }),
              })
            )
          }
        }
      },
    },
  })
  .post("", (req, res) => {
    /**
     * typeof req.query = {
     *   color?: string
     * }
     */
    const pets = getPets({ color: req.query.color });
    /**
     * res.json() typeof input = Array<{
     *   name: string;
     *   color: string
     * }>
     */
    res.json(pets);
  });
```

The above would generate the following openapi path:

```yaml
"/pets":
  get:
    description: Get all pets
    parameters:
      - in: query
        name: color
        schema:
          type: string
          description: "Get only pets with this color"
          example: "grey"
        required: false
    responses:
      "200":
        description: OK
        content:
          application/json:
            schema:
              type: object
              properties:
                name:
                  type: string
                  example: Mittens
                color:
                  type: string
                  example: grey
              required:
                - name
                - color
      "204":
        description: No content
```

## OpenAPIRouter()

```typescript
import { OpenAPIRouter } from "express-openapi-zod";

router = OpenAPIRouter(
  // A zod-to-openapi registry
  registry: OpenAPIRegistry,
  // An express.Router instance to use
  router?: Router,
  options?: {
    // If no media type given, these are used
    defaultRequestBodyMediaTypes: ["application/json"],
    defaultResponseBodyMediaTypes: ["application/json"],
  }
)
```

### Accessing express router

You can access the underlying `express.Router` through the `router` property.

```typescript
export default router.router; // express.Router
```

**The `OpenAPIRouter` cannot be used with `express().use()`**. You must use the underlying express router, either via the `router` property, or passing the router in the constructor.

## openapi()

`OpenAPIRouter.openapi()` takes the same configuration object as the [zod-to-openapi `registerPath` function](https://github.com/asteasolutions/zod-to-openapi#registering-a-path-or-webhook).

### Reduced forms

To reduce the amount of duplication and boilerplate - particularly in cases where your API generally consumes and produces the same media types (such as `application/json`) - you may supply a `z.ZodType` directly to the `request.body` or `responses[*]` fields instead of the full `registerPath` configuration object:

For example, this:

```typescript
router.openapi({
  /*...*/
  request: {
    body: {
      content: {
        "application/json": {
          schema: CreateUserBodySchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "OK",
      content: {
        "application/json": {
          schema: UserSchema,
        },
      },
    },
  },
});
```

and this:

```typescript
router.openapi({
  /*...*/
  request: {
    body: {
      schema: CreateUserBodySchema,
    },
  },
  responses: {
    200: {
      description: "OK",
      schema: UserSchema,
    },
  },
});
```

and this:

```typescript
router.openapi({
  /*...*/
  request: {
    body: CreateUserBodySchema,
  },
  responses: {
    200: UserSchema, // 'description' autogenerated. "OK" in this case
  },
});
```

are all equivalent.

You may also supply `null` to `responses[*]` if there is no response body, but you still want to register a response:

```typescript
router.openapi({
  /*...*/
  responses: {
    200: {
      description: "OK",
    },
    // is the same as:
    200: null,
  },
});
```

#### Content media types for reduced forms

When the content media types are not specified, they will fallback to the `defaultRequestBodyMediaTypes` and `defaultResponseBodyMediaTypes` options given to the `OpenAPIRouter()`

```typescript
const router = OpenAPIRouter(registry, router, {
  defaultRequestBodyMediaTypes: ['application/xml','application/json']
  defaultResponseBodyMediaTypes: ['application/csv']
})
router.openapi({
  /*...*/
  requests: {
    body: CreateUserBodySchema, // registered both `application/xml` and `application/json`
  }
  responses: {
    200: TabularData, // registered as `application/csv` in openapi `responses`
  },
});
```

#### Gotcha with typed unions

See the following:

```typescript
const A = z.object({ id: z.string() });
const B = z.object({ id: z.string(), name: z.string() });

router
  .openapi({
    /*...*/
    responses: {
      200: z.union(A, B),
    },
  })
  .get((req, res) => {
    /**
     * res.json() typeof input = {
     *   id: string;
     * }
     */
  });
```

The type has been reduced to `{ id: string }`, instead of the expected `{ id: string } | { id: string, name: string }`, due to the 'excess property checking' typescript feature.

To get the expected type, pass an `array` instead:

```typescript
router
  .openapi({
    /*...*/
    responses: {
      200: [A, B],
    },
  })
  .get((req, res) => {
    /**
     * res.json() typeof input = {
     *   id: string;
     * } | {
     *   id: string;
     *   name: string;
     * }
     */
  });
```

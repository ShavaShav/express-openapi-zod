import { OpenAPIRouter } from "express-openapi-zod";

import { getOpenAPISpec, registry } from "../registry";

const router = OpenAPIRouter(registry);
router
  .openapi({
    path: "/schema",
    responses: {
      200: {
        description: "The OpenAPI schema",
      },
    },
  })
  .get("", (req, res) => res.json(getOpenAPISpec()));

export default router.router;

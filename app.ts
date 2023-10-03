import express, { json, Request, Response, NextFunction } from "express";
import swaggerAutogenRoutes from "./sag/routes";
import * as swaggerUi from "swagger-ui-express";
import sagSwaggerSpec from "./sag/swaggerSpec.json";

import * as OpenApiValidator from "express-openapi-validator";
import { OpenAPIV3 } from "express-openapi-validator/dist/framework/types";
import zodRouter from "./zod/routes";
import { generateOpenAPI } from "./zod/zod";

const app = express();

export const TEST_RESPONSE_DATA = {
  aNumber: 1,
  aString: "hello world",
  aBoolean: true,
  requiredString: "dsss",
};

// const currentSpec = sagSwaggerSpec;
const currentSpec = generateOpenAPI();

app.use(json());

app.use("/docs", swaggerUi.serve, swaggerUi.setup(currentSpec));
app.use("/schema", (req, res) => res.json(currentSpec));

app.use(
  OpenApiValidator.middleware({
    apiSpec: currentSpec as OpenAPIV3.Document,
    validateRequests: true, // (default)
    validateResponses: true, // false by default
  })
);

// app.use("/test", zodRouter);

app.use("/sag", swaggerAutogenRoutes);

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  // format error
  res.status(err.status || 500).json({
    message: err.message,
    errors: err.errors,
  });
});

app.listen(3000, () => {
  console.log(`🚀 Server ready at: http://localhost:3000`);
});

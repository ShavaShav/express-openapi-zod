import { OpenAPIRouter } from "express-openapi-zod";

import {
  createUser,
  getUser,
  listUsers,
  removeUser,
} from "../controllers/users";
import { ErrorResponse, User, ValidationError } from "../model";
import { registry } from "../registry";
import { z } from "../zod";

const router = OpenAPIRouter(registry);

router
  .openapi({
    path: "/users",
    responses: {
      200: z.array(User),
      500: ErrorResponse,
    },
  })
  .get("", (req, res) => {
    res.json(listUsers());
  });

router
  .openapi({
    path: "/users/{userId}",
    request: {
      params: z.object({
        userId: z.string().openapi({ description: "Identity of user" }),
      }),
    },
    responses: {
      200: User,
      400: ValidationError,
      404: ErrorResponse,
      500: ErrorResponse,
    },
  })
  .get("", (req, res) => {
    const user = getUser(req.params.userId);

    if (!user) {
      res
        .status(404)
        .json({ message: "We couldn't find the user you were looking for!" });
    }

    res.json(user);
  });

router
  .openapi({
    path: "/users",
    request: {
      body: z.object({
        name: z.string(),
      }),
    },
    responses: {
      200: User,
      400: ValidationError,
      500: ErrorResponse,
    },
  })
  .post("", (req, res) => {
    res.json(createUser(req.body));
  });

router
  .openapi({
    path: "/users/{userId}",
    request: {
      params: z.object({
        userId: z.string().openapi({ description: "Identity of user" }),
      }),
    },
    responses: {
      200: null,
      400: ValidationError,
      500: ErrorResponse,
    },
  })
  .delete("/:userId", (req, res) => {
    removeUser(req.params.userId);
    res.sendStatus(200);
  });

export default router.router;

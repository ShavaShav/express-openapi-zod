import { OpenAPIRouter } from "express-openapi-zod";

import {
  createPet,
  getPet,
  listPets,
  removePet,
  withOwner,
} from "../controllers/pets";
import { ErrorResponse, Pet, PetWithOwner, ValidationError } from "../model";
import { registry } from "../registry";
import { z } from "../zod";

const router = OpenAPIRouter(registry);

router
  .openapi({
    path: "/pets",
    request: {
      query: z.object({
        ownerId: z
          .optional(z.string())
          .openapi({ description: "Pets belonging to person." }),
        withOwner: z.optional(z.boolean()).openapi({
          description: "Return the full details of the owner.",
          example: false,
        }),
      }),
    },
    responses: {
      // Array of Pet or PetWithOwner
      200: z.array(z.union([Pet, PetWithOwner])),
    },
  })
  .get("", (req, res) => {
    res.json(
      listPets()
        .filter(
          (pet) => !req.query.ownerId || pet.ownerId === req.query.ownerId
        )
        .map((pet) => (req.query.withOwner ? withOwner(pet) : pet))
    );
  });

router
  .openapi({
    path: "/pets/{petId}",
    request: {
      params: z.object({
        petId: z.string().openapi({ description: "Identity of pet" }),
      }),
      query: z.object({
        withOwner: z.optional(z.boolean()).openapi({
          description: "Return the full details of the owner.",
          example: false,
        }),
      }),
    },
    responses: {
      200: [Pet, PetWithOwner],
      400: ValidationError,
      404: z.object({
        message: z.string().openapi({ example: "Couldn't find it!" }),
      }),
      500: ErrorResponse,
    },
  })
  .get("", (req, res) => {
    const pet = getPet(req.params.petId);

    if (!pet) {
      res
        .status(404)
        .json({ message: "We couldn't find the pet you were looking for!" });
    }

    res.json(pet);
  });

router
  .openapi({
    path: "/pets",
    request: {
      body: {
        description: "Details of pet to create",
        schema: z.object({
          name: z.string(),
          age: z.number(),
          ownerId: z.string(),
        }),
      },
    },
    responses: {
      200: Pet,
      400: ValidationError,
      500: ErrorResponse,
    },
  })
  .post("", (req, res) => {
    res.json(createPet(req.body));
  });

router
  .openapi({
    path: "/pets/{petId}",
    request: {
      params: z.object({
        petId: z.string().openapi({ description: "Identity of pet" }),
      }),
    },
    responses: {
      200: null,
      400: ValidationError,
      500: ErrorResponse,
    },
  })
  .delete("/:petId", (req, res) => {
    removePet(req.params.petId);
    res.sendStatus(200);
  });

export default router.router;

import { v4 as uuidv4 } from "uuid";
import { Pet } from "../model";
import { getUser } from "./users";
import { z } from "../zod";

type PetType = z.infer<typeof Pet>;

const pets: Record<string, PetType> = {};

export const createPet = (body: {
  name: string;
  ownerId?: string;
  age?: number;
}): PetType => {
  const newPet = {
    ...body,
    id: uuidv4(),
  };
  pets[newPet.id] = newPet;
  return newPet;
};

export const getPet = (id: string): PetType => {
  return pets[id];
};

export const listPets = (): PetType[] => {
  return Object.values(pets);
};

export const removePet = (id: string): void => {
  delete pets[id];
};

export const withOwner = (pet: PetType) => {
  return pet.ownerId ? { ...pet, owner: getUser(pet.ownerId) } : pet;
};

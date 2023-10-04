import { v4 as uuidv4 } from "uuid";
import { User } from "../model";
import { z } from "../zod";

type UserType = z.infer<typeof User>;

const users: Record<string, UserType> = {};

export const createUser = (body: { name: string }): UserType => {
  const newUser = {
    ...body,
    id: uuidv4(),
  };
  users[newUser.id] = newUser;
  return newUser;
};

export const getUser = (id: string): UserType => {
  return users[id];
};

export const listUsers = (): UserType[] => {
  return Object.values(users);
};

export const removeUser = (id: string): void => {
  delete users[id];
};

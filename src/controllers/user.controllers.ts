import type { Context } from "hono";
import { User } from "../models/user.model";

export const getUser = async (c: Context) => {
  const users = await User.findAll();
  return c.json(users);
};

import type { Context } from "hono";
import { User } from "../models/user.model";
import { registeredSchema } from "../validators/auth.validator";
import bcrypt from "bcryptjs";
import { updateUser } from "../validators/user.validator";

export const getUser = async (c: Context) => {
  const users = await User.findAll();
  return c.json(users);
};

export const register = async (c: Context) => {
  const body = await c.req.json();

  const data = registeredSchema.parse(body);

  const exist = await User.findOne({
    where: {
      email: data.email,
    },
  });

  if (exist) {
    return c.json({ message: "Email already used" }, 400);
  }

  const hashed = await bcrypt.hash(data.password, 10);

  const user = await User.create({
    name: data.name,
    email: data.email,
    password: hashed,
  });

  return c.json(
    {
      message: "Registered success",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    },
    201,
  );
};

export const update = async (c: Context) => {
  const authUser = c.get("user") as {
    id: number;
  };
  const body = await c.req.json();

  const data = updateUser.parse(body);

  const user = await User.findByPk(authUser.id);
  if (!user) {
    return c.json({ message: "Users not found" }, 404);
  }

  if (data.name !== undefined) {
    user.name = data.name;
  }

  if (data.email !== undefined) {
    user.email = data.email;
  }

  if (data.password !== undefined) {
    user.password = await bcrypt.hash(data.password, 10);
  }

  await user.save();

  return c.json({
    message: "User updated",
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
  });
};

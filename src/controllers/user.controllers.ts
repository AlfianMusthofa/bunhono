import type { Context } from "hono";
import { User } from "../models/user.model";
import { registeredSchema } from "../validators/auth.validator";
import bcrypt from "bcryptjs";
import { updateUser } from "../validators/user.validator";
import { Event } from "../models/event.model";
import {
  getAllUsers,
  getSingleUserById,
  registerUser,
} from "../service/user-service";

export const getUser = async (c: Context) => {
  const users = await getAllUsers();
  return c.json(users);
};

export const register = async (c: Context) => {
  const body = await c.req.json();
  const parsed = registeredSchema.safeParse(body);

  if (!parsed.success) {
    return c.json(
      {
        message: "Validation error",
        errors: parsed.error.flatten(),
      },
      400,
    );
  }

  const data = parsed.data;

  try {
    const user = await registerUser(data);
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
  } catch (err: any) {
    if (err.message === "EMAIL_EXISTS") {
      return c.json({ message: "Email already used" }, 400);
    }
    return c.json({ message: "Internal server error" }, 500);
  }
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

export const getUserById = async (c: Context) => {
  const userId = Number(c.req.param("id"));
  const user = await getSingleUserById(userId);

  if (!user) {
    return c.json({ message: " User not found!" }, 404);
  }

  return c.json(user);
};

export const getMe = async (c: Context) => {
  const authUser = c.get("user") as { id: number };

  const user = await User.findByPk(authUser.id, {
    attributes: ["id", "name", "email"],
  });

  if (!user) {
    return c.json({ message: "User not found!" }, 404);
  }

  return c.json(user);
};

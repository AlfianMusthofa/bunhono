import type { Context } from "hono";
import bcrypt from "bcryptjs";
import { User } from "../models/user.model";
import { registeredSchema, loginSchema } from "../validators/auth.validator";
import { signToken } from "../utils/jwt";

export const register = async (c: Context) => {
  const body = c.req.json();
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

export const login = async (c: Context) => {
  const body = await c.req.json();
  const data = loginSchema.parse(body);

  const user = await User.findOne({
    where: {
      email: data.email,
    },
  });

  if (!user) {
    return c.json({ message: "Email or Password Invalid!" }, 401);
  }

  const match = await bcrypt.compare(data.password, user.password);

  if (!match) {
    return c.json({ message: "Email or Password Invalid!" }, 401);
  }

  const token = signToken({
    id: user.id,
    email: user.email,
  });

  return c.json({
    message: "Login Success",
    username: user.name,
    token,
  });
};

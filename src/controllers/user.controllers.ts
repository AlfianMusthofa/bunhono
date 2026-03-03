import type { Context } from "hono";
import { User } from "../models/user.model";
import { Event } from "../models/event.model";
import {
  getAllUsers,
  getSingleUserById,
  registerUser,
} from "../service/user-service";
import { saveImage } from "../utils/upload";

export const getUser = async (c: Context) => {
  const search = c.req.query("search");
  const page = Number(c.req.query("page")) || 1;
  const limit = Number(c.req.query("limit")) || 10;

  const users = await getAllUsers(search, page, limit);
  return c.json(users);
};

export const registerUserNew = async (c: Context) => {
  const formdata = await c.req.formData();
  const name = formdata.get("name") as string;
  const email = formdata.get("email") as string;
  const password = formdata.get("password") as string;
  const imageFile = formdata.get("image") as File | null;
  let imagePath: string | null = null;

  if (imageFile) {
    if (!imageFile.type.startsWith("image/")) {
      return c.json({ message: "File must be an image" }, 400);
    }
    if (imageFile.size > 1_000_000) {
      return c.json({ message: "Image size max 2MB" }, 400);
    }
    const uploaded = await saveImage(imageFile);
    imagePath = uploaded.secure_url;
  }

  const user = await User.create({
    name,
    email,
    password,
    image: imagePath,
  });

  return c.json(user, 201);
};

export const updateUserNew = async (c: Context) => {
  const authUser = c.get("user") as { id: number };
  const formdata = await c.req.formData();
  const name = formdata.get("name") as string;
  const email = formdata.get("email") as string;
  const password = formdata.get("password") as string;
  const imageFile = formdata.get("image") as File | null;

  const user = await User.findByPk(authUser.id);
  if (!user) {
    return c.json({ message: "User not found kocak" }, 404);
  }

  if (typeof name === "string") user.name = name;
  if (typeof email === "string") user.email = email;
  if (typeof password === "string") user.password = email;

  if (imageFile && imageFile.size > 0) {
    const uploaded = await saveImage(imageFile);
    user.image = uploaded.secure_url;
  }

  await user.save();

  return c.json({
    message: "User has been updated",
    user,
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

export const userEventHistory = async (c: Context) => {
  const authUser = c.get("user") as { id: number };

  if (!authUser?.id || isNaN(authUser.id)) {
    return c.json({ message: "Invalid id user" }, 401);
  }

  const user = await User.findByPk(authUser.id, {
    attributes: ["id", "name"],
    include: {
      model: Event,
      attributes: ["id", "title", "location"],
      through: {
        attributes: [],
      },
    },
  });

  if (!user) {
    return c.json({ message: "History not found" }, 404);
  }

  return c.json({
    user: {
      id: user.id,
      name: user.name,
    },
    Events: user.Events,
  });
};

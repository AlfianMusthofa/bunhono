import type { Context } from "hono";
import { User } from "../models/user.model";
import {
  getAllUsers,
  getSingleUserById,
  UpdateUserService,
  UserEventHistoryService,
} from "../service/user-service";
import { saveImage } from "../utils/upload";
import bcrypt from "bcryptjs";

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

  const hashedPassword = await bcrypt.hash(password, 10);

  const existingEmail = await User.findOne({
    where: { email },
  });

  if (existingEmail) {
    return c.json({ message: "Email already exist" }, 400);
  }

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
  });

  return c.json(user, 201);
};

export const updateUserNew = async (c: Context) => {
  const authUser = c.get("user") as { id: number };
  const formdata = await c.req.formData();
  const name = formdata.get("name") as string;
  const email = formdata.get("email") as string;
  const password = formdata.get("password") as string;
  const imageFile = formdata.get("image") as File;

  try {
    const user = await UpdateUserService(
      authUser.id,
      name,
      email,
      password,
      imageFile,
    );

    return c.json({
      message: "User has been updated",
      user,
    });
  } catch (error: any) {
    if (error.message === "INVALID_id") {
      return c.json({ message: "Invalid Id" }, 400);
    }

    if (error.message === "USER_NOT_FOUND") {
      return c.json({ message: "User not found" }, 404);
    }

    console.log(error);
  }
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
  const page = Number(c.req.query("page")) || 1;
  const limit = Number(c.req.query("limit")) || 10;
  const search = c.req.query("search");

  try {
    const history = await UserEventHistoryService(
      search,
      page,
      limit,
      authUser.id,
    );
    return c.json(history);
  } catch (error: any) {
    if (error.message === "HISTORY_NOT_FOUND") {
      return c.json({ message: "History not found" }, 404);
    }
    if (error.message === "INVALID_ID") {
      return c.json({ message: "Invalid Id User" }, 404);
    }
    console.log(error);
  }
};

export const updateUserById = async (c: Context) => {
  const userId = Number(c.req.param("id"));
  const formData = await c.req.formData();
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const image = formData.get("image") as File;

  const user = await User.findByPk(userId);

  if (!user) {
    return c.json({ message: "User not found" }, 404);
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  if (typeof name === "string") user.name = name;
  if (typeof email === "string") user.email = email;
  if (typeof password === "string") user.password = hashedPassword;

  if (image && image.size > 0) {
    const upload = await saveImage(image);
    user.image = upload.secure_url;
  }

  await user.save();

  return c.json({
    message: "User has been updated",
    user,
  });
};

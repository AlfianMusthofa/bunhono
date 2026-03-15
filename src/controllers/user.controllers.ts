import type { Context } from "hono";
import {
  getAllUsers,
  getSingleUserById,
  RegisterUserServive,
  UpdateUserByIdService,
  UpdateUserService,
  UserEventHistoryService,
} from "../service/user-service";

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

  try {
    await RegisterUserServive(name, email, password);
    return c.json({ message: "User has been created!" });
  } catch (error) {
    console.log(error);
  }
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

  try {
    await UpdateUserByIdService(userId, name, email, password, image);
    return c.json({ message: "user has been updated" });
  } catch (error) {
    console.log(error);
  }
};

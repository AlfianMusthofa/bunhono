import type { Context } from "hono";
import {
  AddMentorService,
  GetAllMentorsService,
  UpdateMentorService,
} from "../service/mentor-service";

export const addMentor = async (c: Context) => {
  const formdata = await c.req.formData();
  const name = formdata.get("name") as string;
  const position = formdata.get("position") as string;
  const bio = formdata.get("bio") as string;
  const image = formdata.get("image") as File;

  try {
    await AddMentorService(name, position, bio, image);
    return c.json({ message: "Mentor has been created!" });
  } catch (error) {
    console.log(error);
  }
};

export const getAllMentors = async (c: Context) => {
  const limit = Number(c.req.query("limit")) || 5;
  const page = Number(c.req.query("page")) || 1;
  const search = c.req.query("search");
  const mentors = await GetAllMentorsService(limit, page, search);
  return c.json(mentors);
};

export const updateMentor = async (c: Context) => {
  const id = Number(c.req.param("id"));
  const formData = await c.req.formData();
  const name = formData.get("name") as string;
  const position = formData.get("position") as string;
  const bio = formData.get("bio") as string;
  const image = formData.get("image") as File;

  try {
    await UpdateMentorService(id, name, position, bio, image);
    return c.json({ message: "Mentor updated!" });
  } catch (error) {
    console.log(error);
  }
};

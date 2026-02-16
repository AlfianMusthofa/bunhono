import { Mentor } from "../models/mentor.model";
import type { Context } from "hono";
import { saveImage } from "../utils/upload";

export const addMentor = async (c: Context) => {
  const formdata = await c.req.formData();
  const name = formdata.get("name") as string;
  const position = formdata.get("position") as string;
  const bio = formdata.get("bio") as string;
  const imageFile = formdata.get("image") as File | null;
  let imagePath: string | null = null;

  if (!name) {
    return c.json({ message: "Name is required" }, 400);
  }

  if (imageFile) {
    if (!imageFile.type.startsWith("image/")) {
      return c.json({ message: "File must be image!" }, 400);
    }
    if (imageFile.size > 2_000_000) {
      return c.json({ message: "Image max size is 2MB" }, 200);
    }

    const uploaded = await saveImage(imageFile);
    imagePath = uploaded.secure_url;
  }

  const mentor = await Mentor.create({
    name,
    position,
    bio,
    image: imagePath,
  });

  return c.json({
    message: "Mentor has been added!",
    mentor,
  });
};

export const getAllMentors = async (c: Context) => {
  const mentors = await Mentor.findAll();
  return c.json(mentors);
};

export const updateMentor = async (c: Context) => {
  const id = Number(c.req.param("id"));
  const formData = await c.req.formData();
  const name = formData.get("name") as string;
  const position = formData.get("position") as string;
  const bio = formData.get("bio") as string;
  const imageMentor = formData.get("image") as File | null;

  const mentor = await Mentor.findByPk(id);

  if (!mentor) {
    return c.json({ message: "Mentor not found!" }, 404);
  }

  if (typeof name === "string") mentor.name = name;
  if (typeof position === "string") mentor.position = position;
  if (typeof bio === "string") mentor.bio = position;

  if (imageMentor && imageMentor.size > 0) {
    const uploaded = await saveImage(imageMentor);
    mentor.image = uploaded.secure_url;
  }

  await mentor.save();

  return c.json({
    message: "Mentor has been updated!",
    mentor,
  });
};

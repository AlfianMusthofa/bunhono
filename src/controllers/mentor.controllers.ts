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

    imagePath = await saveImage(imageFile);
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

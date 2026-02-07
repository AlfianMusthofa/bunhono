import type { Context } from "hono";
import { Event } from "../models/event.model";
import { saveImage } from "../utils/upload";
import { User } from "../models/user.model";
import { Category } from "../models/category.model";
import { Mentor } from "../models/mentor.model";

export const createEvent = async (c: Context) => {
  const formData = await c.req.formData();

  const title = formData.get("title") as string;
  if (!title) {
    return c.json({ message: "Title is required" }, 400);
  }

  const location = formData.get("location") as string;
  if (!location) {
    return c.json({ message: "Location is required" }, 400);
  }

  const description = formData.get("description") as string;

  const startAtRaw = formData.get("startAt");
  if (!startAtRaw || typeof startAtRaw !== "string") {
    return c.json({ message: "startAt is required" }, 400);
  }

  const startAt = new Date(startAtRaw);
  if (isNaN(startAt.getTime())) {
    return c.json({ message: "Invalid startAt date" }, 400);
  }

  const imageFile = formData.get("image") as File | null;
  let imagePath: string | null = null;

  if (imageFile) {
    if (!imageFile.type.startsWith("image/")) {
      return c.json({ message: "File must be an image" }, 400);
    }

    if (imageFile.size > 2_000_000) {
      return c.json({ message: "Image max size is 2MB" }, 400);
    }

    imagePath = await saveImage(imageFile);
  }

  const event = await Event.create({
    title,
    description,
    startAt,
    location,
    image: imagePath,
  });

  return c.json(event, 201);
};

export const getAllEvents = async (c: Context) => {
  const events = await Event.findAll({
    include: [
      {
        model: Category,
        attributes: ["name"],
      },
      {
        model: Mentor,
        attributes: ["name"],
      },
    ],
  });
  return c.json(events);
};

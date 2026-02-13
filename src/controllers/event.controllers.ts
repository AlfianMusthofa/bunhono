import type { Context } from "hono";
import { Event } from "../models/event.model";
import { saveImage } from "../utils/upload";
import { User } from "../models/user.model";
import { Category } from "../models/category.model";
import { Mentor } from "../models/mentor.model";
import { EventParticipantModel } from "../models/eventParticipant.model";

export const createEvent = async (c: Context) => {
  const formData = await c.req.formData();

  const title = formData.get("title") as string;
  const location = formData.get("location") as string;
  const description = formData.get("description") as string;
  const startAtRaw = formData.get("startAt");
  const mentorId = formData.get("mentorId");
  const categoryId = formData.get("categoryId");
  const imageFile = formData.get("image") as File | null;

  if (!title) {
    return c.json({ message: "Title is required" }, 400);
  }

  if (!location) {
    return c.json({ message: "Location is required" }, 400);
  }

  if (!startAtRaw || typeof startAtRaw !== "string") {
    return c.json({ message: "startAt is required" }, 400);
  }

  const startAt = new Date(startAtRaw);
  if (isNaN(startAt.getTime())) {
    return c.json({ message: "Invalid startAt date" }, 400);
  }

  let imagePath: string | null = null;

  if (imageFile) {
    if (!imageFile.type.startsWith("image/")) {
      return c.json({ message: "File must be an image" }, 400);
    }

    if (imageFile.size > 2_000_000) {
      return c.json({ message: "Image max size is 2MB" }, 400);
    }

    const uploaded = await saveImage(imageFile);
    imagePath = uploaded.secure_url;
  }

  const event = await Event.create({
    title,
    description,
    startAt,
    location,
    mentorId,
    categoryId,
    image: imagePath,
  });

  return c.json(event, 201);
};

export const getAllEvents = async (c: Context) => {
  const limit = Number(c.req.query("limit")) || 10;
  const page = Number(c.req.query("page")) || 1;
  const offset = (page - 1) * limit;

  const { rows, count } = await Event.findAndCountAll({
    limit,
    offset,
    order: [["startAt", "DESC"]],
    include: [
      { model: Category, attributes: ["name"] },
      { model: Mentor, attributes: ["name"] },
    ],
  });

  return c.json({
    data: rows,
    meta: {
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit),
    },
  });
};

export const updateEvent = async (c: Context) => {
  const id = Number(c.req.param("id"));
  const formData = await c.req.formData();
  const title = formData.get("title") as string;
  const location = formData.get("location") as string;
  const description = formData.get("description") as string;
  const startAt = formData.get("startAt") as Date | null;
  const imageEventNew = formData.get("image") as File | null;

  const event = await Event.findByPk(id);

  if (!event) {
    return c.json({ message: "Event not found!" }, 404);
  }

  if (typeof title === "string") event.title = title;
  if (typeof location === "string") event.location = location;
  if (typeof description === "string") event.description = description;
  if (typeof startAt === "string") event.startAt = startAt;

  if (imageEventNew && imageEventNew.size > 0) {
    const uploaded = await saveImage(imageEventNew);
    event.image = uploaded.secure_url;
  }

  await event.save();

  return c.json({
    message: "Event has been updated!",
    event,
  });
};

export const joinEvent = async (c: Context) => {
  const authUserId = c.get("user") as { id: number };
  const userId = authUserId.id;
  const eventId = Number(c.req.param("id"));

  if (Number.isNaN(eventId)) {
    return c.json({ message: "Invalid event id" }, 400);
  }

  const event = await Event.findByPk(eventId);
  if (!event) {
    return c.json({ message: "Event not found!" }, 404);
  }

  const exits = await EventParticipantModel.findOne({
    where: {
      userId,
      eventId,
    },
  });

  if (exits) {
    return c.json({ message: "User already joined!" }, 400);
  }

  await EventParticipantModel.create({
    userId: authUserId.id,
    eventId: eventId,
  });

  return c.json({ message: "Success to join this event" }, 201);
};

export const getEventById = async (c: Context) => {
  const id = Number(c.req.param("id"));

  const event = await Event.findByPk(id, {
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

  if (!event) {
    return c.json({ message: "Event not found!" }, 404);
  }

  return c.json({
    event,
  });
};

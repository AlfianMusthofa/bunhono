import type { Context } from "hono";
import { Event } from "../models/event.model";
import { saveImage } from "../utils/upload";
import {
  getAllEventsFunction,
  getEventByIdFunction,
  getEventBySlugService,
  getEventMonthlyStats,
  getParticipantsMonthlyStats,
  getUpcomingEvents,
  joinEventService,
} from "../service/event-service";
import { generateSlug } from "../utils/slug";

export const createEvent = async (c: Context) => {
  const formData = await c.req.formData();

  const title = formData.get("title") as string;
  const location = formData.get("location") as string;
  const description = formData.get("description") as string;
  const startAtRaw = formData.get("startAt");
  const endAtRaw = formData.get("endAt");
  const mentorId = formData.get("mentorId");
  const categoryId = formData.get("categoryId");
  const statusId = formData.get("statusId");
  const capacity = formData.get("capacity");
  const imageFile = formData.get("image") as File | null;
  const locationType = formData.get("locationType") as string;
  const meetingLink = formData.get("meetingLink") as string | null;
  const priceType = formData.get("priceType") as string;
  const price = formData.get("price");

  const slug = generateSlug(title);

  if (!title) {
    return c.json({ message: "Title is required" }, 400);
  }

  if (!locationType || !["offline", "online"].includes(locationType)) {
    return c.json({ message: "locationType must be offline or online" }, 400);
  }

  if (!priceType || !["free", "paid"].includes(priceType)) {
    return c.json({ message: "PriceType must be free or paid" }, 400);
  }

  if (locationType === "offline" && !location) {
    return c.json({ message: "Location is required for offline event" }, 400);
  }

  if (locationType === "online" && !meetingLink) {
    return c.json(
      { message: "Meeting link is required for online event" },
      400,
    );
  }

  if (priceType === "paid" && !price) {
    return c.json(
      {
        message: "Price is required for paid event",
      },
      400,
    );
  }

  if (!startAtRaw || typeof startAtRaw !== "string") {
    return c.json({ message: "startAt is required" }, 400);
  }

  if (!endAtRaw || typeof endAtRaw !== "string") {
    return c.json({ message: "endAt is required" }, 400);
  }

  const startAt = new Date(startAtRaw);
  if (isNaN(startAt.getTime())) {
    return c.json({ message: "Invalid startAt date" }, 400);
  }

  const endAt = new Date(endAtRaw);
  if (isNaN(endAt.getTime())) {
    return c.json({ message: "Invalid endAt date" }, 400);
  }

  let imagePath: string | null = null;

  const finalLocation = locationType === "offline" ? location : null;
  const finalMeetingLink = locationType === "online" ? meetingLink : null;

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
    endAt,
    locationType,
    location: finalLocation,
    meetingLink: finalMeetingLink,
    mentorId,
    categoryId,
    image: imagePath,
    slug: slug,
    statusId,
    capacity,
    priceType,
    price,
  });

  return c.json(event, 201);
};

export const getAllEvents = async (c: Context) => {
  const limit = Number(c.req.query("limit")) || 10;
  const page = Number(c.req.query("page")) || 1;
  const status = c.req.query("status");
  const category = c.req.query("category");
  const search = c.req.query("search");

  const result = await getAllEventsFunction({
    limit,
    page,
    status,
    category,
    search,
  });

  return c.json({
    data: result.rows,
    meta: {
      total: result.count,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
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
  const endAt = formData.get("endAt") as Date | null;
  const imageEventNew = formData.get("image") as File;

  const statusIdRaw = formData.get("statusId");
  const categoryIdRaw = formData.get("categoryId");
  const mentorIdRaw = formData.get("mentorId");
  const capacityRaw = formData.get("capacity");
  const meetingLinkRaw = formData.get("meetingLink")?.toString();
  const priceRaw = formData.get("price");
  const priceTypeRaw = formData.get("priceType");
  const locationTypeRaw = formData.get("locationType");

  if (!startAt && !endAt) {
    return c.json({ message: "Start and end is required" }, 400);
  }

  const event = await Event.findByPk(id);

  if (!event) {
    return c.json({ message: "Event not found!" }, 404);
  }

  if (typeof title === "string") event.title = title;
  if (typeof location === "string") event.location = location;
  if (typeof description === "string") event.description = description;
  if (typeof startAt === "string") event.startAt = startAt;
  if (typeof endAt === "string") event.endAt = endAt;
  if (typeof meetingLinkRaw === "string") event.meetingLink = meetingLinkRaw;
  if (typeof priceRaw === "number") event.price = priceRaw;

  if (imageEventNew && imageEventNew.size > 0) {
    const uploaded = await saveImage(imageEventNew);
    event.image = uploaded.secure_url;
  }

  if (statusIdRaw !== undefined && statusIdRaw !== null && statusIdRaw !== "") {
    const statusIdNew = Number(statusIdRaw);
    if (Number.isNaN(statusIdNew)) {
      throw new Error("Status Id tidak valid");
    }
    event.statusId = statusIdNew;
  }

  if (
    categoryIdRaw !== undefined &&
    categoryIdRaw !== null &&
    categoryIdRaw !== ""
  ) {
    const categoryIdNew = Number(categoryIdRaw);
    if (Number.isNaN(categoryIdNew)) {
      throw new Error("Category Id tidak valid");
    }
    event.categoryId = categoryIdNew;
  }

  if (mentorIdRaw !== undefined && mentorIdRaw !== null && mentorIdRaw !== "") {
    const mentorIdNew = Number(mentorIdRaw);
    if (Number.isNaN(mentorIdNew)) {
      throw new Error("Mentor Id tidak valid");
    }
    event.mentorId = mentorIdNew;
  }

  if (capacityRaw !== undefined && capacityRaw !== null && capacityRaw !== "") {
    const capacityNew = Number(capacityRaw);
    if (Number.isNaN(capacityNew)) {
      throw new Error("Capacity tidak valid");
    }
    event.capacity = capacityNew;
  }

  if (typeof priceTypeRaw === "string" && priceTypeRaw !== "") {
    if (!["free", "paid"].includes(priceTypeRaw)) {
      throw new Error("PriceType tidak valid");
    }
    event.priceType = priceTypeRaw as "free" | "paid";
  }

  if (typeof locationTypeRaw === "string" && locationTypeRaw !== "") {
    if (!["offline", "online"].includes(locationTypeRaw)) {
      throw new Error("locationType tidak valid");
    }
    event.locationType = locationTypeRaw as "offline" | "online";
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

  try {
    await joinEventService(userId, eventId);
    return c.json(
      {
        message: "Success joined",
      },
      200,
    );
  } catch (error: any) {
    if (error.message === "EVENT_NOT_FOUND") {
      return c.json({ message: "Event not found" }, 404);
    }

    if (error.message === "USER_ALREADY_JOINED") {
      return c.json({ message: "User already joined" }, 400);
    }

    return c.json({ message: "Internal server error!" }, 500);
  }
};

export const getEventById = async (c: Context) => {
  const id = Number(c.req.param("id"));

  const event = await getEventByIdFunction({ id });

  if (!event) {
    return c.json({ message: "Event not found!" }, 404);
  }

  return c.json(event);
};

export const getEventBySlug = async (c: Context) => {
  const slug = c.req.param("slug");
  const result = await getEventBySlugService({ slug });

  if (!result) {
    return c.json(
      {
        message: "Event not found!",
      },
      404,
    );
  }

  return c.json(result);
};

export const getEventMonthlyChart = async (c: Context) => {
  const stats = await getEventMonthlyStats();

  return c.json({
    data: stats,
  });
};

export const getParticipantsMonthlyChart = async (c: Context) => {
  const data = await getParticipantsMonthlyStats();
  return c.json({ data });
};

export const getUpcomingEventsController = async (c: Context) => {
  const limit = Number(c.req.query("limit")) || 5;

  const events = await getUpcomingEvents({ limit });

  return c.json({
    data: events,
  });
};

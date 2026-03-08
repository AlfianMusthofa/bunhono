import type { Context } from "hono";
import { Event } from "../models/event.model";
import { saveImage } from "../utils/upload";
import {
  CreateEventService,
  getAllEventsFunction,
  getEventByIdFunction,
  getEventBySlugService,
  getEventMonthlyStats,
  getParticipantsMonthlyStats,
  getUpcomingEvents,
  joinEventService,
} from "../service/event-service";

export const createEvent = async (c: Context) => {
  const formData = await c.req.formData();

  const title = formData.get("title") as string;
  const location = formData.get("location") as string;
  const description = formData.get("description") as string;
  const startAtRaw = formData.get("startAt") as string;
  const endAtRaw = formData.get("endAt") as string;
  const mentorId = Number(formData.get("mentorId"));
  const categoryId = Number(formData.get("categoryId"));
  const statusId = Number(formData.get("statusId"));
  const capacity = Number(formData.get("capacity"));
  const imageFile = formData.get("image") as File;
  const locationType = formData.get("locationType") as string;
  const meetingLink = formData.get("meetingLink") as string;
  const priceType = formData.get("priceType") as string;
  const price = Number(formData.get("price"));

  try {
    const event = await CreateEventService(
      title,
      location,
      description,
      startAtRaw,
      endAtRaw,
      mentorId,
      statusId,
      categoryId,
      capacity,
      imageFile,
      locationType,
      meetingLink,
      priceType,
      price,
    );

    return c.json(event);
  } catch (error: any) {
    console.log(error);
  }
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

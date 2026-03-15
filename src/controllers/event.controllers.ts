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
  UpdateEventService,
} from "../service/event-service";
import { EventParticipantModel } from "../models/eventParticipant.model";

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
  const startAt = formData.get("startAt") as string;
  const endAt = formData.get("endAt") as string;
  const imageEventNew = formData.get("image") as File;

  const statusIdRaw = Number(formData.get("statusId"));
  const categoryIdRaw = Number(formData.get("categoryId"));
  const mentorIdRaw = Number(formData.get("mentorId"));
  const capacityRaw = Number(formData.get("capacity"));
  const meetingLinkRaw = formData.get("meetingLink") as string;
  const priceTypeRaw = formData.get("priceType") as string;
  const locationTypeRaw = formData.get("locationType") as string;
  const priceRaw = Number(formData.get("capacity"));

  try {
    const event = await UpdateEventService(
      id,
      title,
      location,
      description,
      startAt,
      endAt,
      imageEventNew,
      statusIdRaw,
      mentorIdRaw,
      categoryIdRaw,
      capacityRaw,
      locationTypeRaw,
      meetingLinkRaw,
      priceTypeRaw,
      priceRaw,
    );

    return c.json(event);
  } catch (error) {
    console.log(error);
  }
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

export const countUserHistory = async (c: Context) => {
  const authUser = c.get("user") as { id: number };
  if (isNaN(authUser.id)) {
    console.log("NAN");
  }
  const total = await EventParticipantModel.count({
    where: { userId: authUser.id },
  });
  return c.json({ total });
};

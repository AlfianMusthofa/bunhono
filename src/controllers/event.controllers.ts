import type { Context } from "hono";
import { Event } from "../models/event.model";
import { EventParticipantModel } from "../models/eventParticipant.model";
import { nanoid } from "nanoid";
import QRCode from "qrcode";
import { SendTicketEmail } from "../utils/SendTicketEmail";
import { EventService } from "../service/event-service";

export class EventContoller {
  static async getAllEvents(c: Context) {
    const limit = Number(c.req.query("limit")) || 10;
    const page = Number(c.req.query("page")) || 1;
    const status = c.req.query("status");
    const category = c.req.query("category");
    const search = c.req.query("search");
    const organizer = Number(c.req.query("organizerId"));

    const result = await EventService.getAllEventsFunction({
      limit,
      page,
      status,
      category,
      search,
      organizer,
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
  }

  static async createEvent(c: Context) {
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
      const event = await EventService.CreateEventService(
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
  }

  static async updateEvent(c: Context) {
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
      const event = await EventService.UpdateEventService(
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
  }

  static async joinEvent(c: Context) {
    const authUserId = c.get("user") as { id: number; email: string };
    const userId = authUserId.id;
    const emailUser = authUserId.email;
    const eventId = Number(c.req.param("id"));

    if (Number.isNaN(eventId)) {
      return c.json({ message: "Invalid event id" }, 400);
    }

    const ticketCode = `EVT-${eventId}-${nanoid(6)}`;

    try {
      const event = await Event.findByPk(eventId);

      await EventService.joinEventService(userId, eventId, ticketCode);
      const qrCode = await QRCode.toDataURL(ticketCode);

      if (event?.locationType === "offline") {
        setTimeout(() => {
          SendTicketEmail(emailUser, qrCode, {
            title: event.title,
            location: event.location,
            date: event.startAt,
          });
        }, 2000);
      }

      return c.json(
        {
          message: "Success joined",
          data: {
            qrCode,
          },
        },
        200,
      );
    } catch (error: any) {
      return c.json({ message: "Internal server error!" }, 500);
    }
  }

  static async getEventById(c: Context) {
    const id = Number(c.req.param("id"));

    const event = await EventService.getEventByIdFunction({ id });

    if (!event) {
      return c.json({ message: "Event not found!" }, 404);
    }

    return c.json(event);
  }

  static async getEventBySlug(c: Context) {
    const slug = c.req.param("slug");
    const result = await EventService.getEventBySlugService({ slug });

    if (!result) {
      return c.json(
        {
          message: "Event not found!",
        },
        404,
      );
    }

    return c.json(result);
  }

  static async getEventMonthlyChart(c: Context) {
    const stats = await EventService.getEventMonthlyStats();

    return c.json({
      data: stats,
    });
  }

  static async getParticipantsMonthlyChart(c: Context) {
    const data = await EventService.getParticipantsMonthlyStats();
    return c.json({ data });
  }

  static async getUpcomingEventsController(c: Context) {
    const limit = Number(c.req.query("limit")) || 5;
    const organizerId = c.req.query("organizerId");

    const events = await EventService.getUpcomingEvents({
      limit,
      organizerId: organizerId ? Number(organizerId) : undefined,
    });

    return c.json({
      data: events,
    });
  }

  static async countUserHistory(c: Context) {
    const authUser = c.get("user") as { id: number };
    if (isNaN(authUser.id)) {
      console.log("NAN");
    }
    const total = await EventParticipantModel.count({
      where: { userId: authUser.id },
    });
    return c.json({ total });
  }
}

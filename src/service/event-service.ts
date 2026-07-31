import { sequelize } from "../config/database";
import { Category } from "../models/category.model";
import { Event } from "../models/event.model";
import { EventStatus } from "../models/eventStatus.model";
import { Mentor } from "../models/mentor.model";
import { EventParticipantModel } from "../models/eventParticipant.model";
import { Op, Sequelize, UniqueConstraintError } from "sequelize";
import { saveImage } from "../utils/upload";
import { User } from "../models/user.model";
import { Certificate } from "../models/certificate.model";
import { generateSlug } from "../utils/slug";
import { BadRequestError } from "../errors/BadRequestError";
import { NotFoundError } from "../errors/NotFoundError";
import { Organizers } from "../models/organizers.model";
import { EventFAQ } from "../models/eventFaq.model";

interface EventProps {
  limit?: number;
  page?: number;
  id?: number;
  slug?: string;
}

export class EventService {
  static async getAllEventsFunction({
    limit = 10,
    page = 1,
    status,
    category,
    search,
    organizer,
  }: {
    limit?: number;
    page?: number;
    status?: string;
    category?: string;
    search?: string;
    organizer?: number;
  }) {
    const offset = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.title = {
        [Op.like]: `%${search}%`,
      };
    }

    if (category) {
      const categoryId = Number(category);
      if (!Number.isNaN(categoryId)) {
        where.categoryId = categoryId;
      }
    }

    if (organizer) {
      const organizerId = Number(organizer);
      if (!Number.isNaN(organizerId)) {
        where.organizerId = organizerId;
      }
    }

    const rows = await Event.findAll({
      where,
      include: [
        { model: Category, attributes: ["id", "name"] },
        { model: Mentor, attributes: ["id", "name"] },
        {
          model: EventStatus,
          as: "status",
          attributes: ["id", "code", "name"],
          ...(status && {
            where: { code: status },
            required: true,
          }),
        },
        {
          model: EventParticipantModel,
          attributes: [],
        },
        {
          model: Certificate,
          attributes: ["id", "templatePath", "createdAt"],
          where: {
            participantId: null,
          },
          required: false,
        },
      ],
      attributes: {
        include: [
          [
            Sequelize.fn("COUNT", Sequelize.col("EventParticipantModels.id")),
            "registered_count",
          ],
        ],
      },
      group: [
        "Event.id",
        "Category.id",
        "Mentor.id",
        "status.id",
        "Certificates.id",
      ],
      order: [["startAt", "DESC"]],
      limit,
      offset,
      subQuery: false,
    });

    const count = await Event.count({
      where,
      include: status
        ? [
            {
              model: EventStatus,
              as: "status",
              where: { code: status },
              required: true,
            },
          ]
        : [],
      distinct: true,
    });

    const totalPages = Math.ceil(count / limit);

    return {
      rows,
      count,
      page,
      limit,
      totalPages,
    };
  }

  static async getEventByIdFunction({ id }: EventProps) {
    const event = await Event.findByPk(id, {
      attributes: {
        include: [
          [
            sequelize.fn("COUNT", sequelize.col("EventParticipantModels.id")),
            "registered_count",
          ],
        ],
      },
      include: [
        {
          model: Category,
          attributes: ["name"],
        },
        {
          model: Mentor,
          attributes: ["name"],
        },
        {
          model: EventStatus,
          attributes: ["name"],
          as: "status",
        },
        {
          model: EventParticipantModel,
          attributes: ["id", "createdAt"],
          include: [
            {
              model: User,
              attributes: ["id", "name", "email"],
            },
          ],
        },
        {
          model: Certificate,
          attributes: ["templatePath"],
        },
      ],
      group: [
        "Event.id",
        "Category.id",
        "Mentor.id",
        "status.id",
        "EventParticipantModels.id",
        "EventParticipantModels->User.id",
        "Certificates.id",
      ],
    });

    return event;
  }

  static async getEventBySlugService({ slug }: EventProps) {
    const result = await Event.findOne({
      where: {
        slug,
      },
      include: [
        {
          model: Category,
          attributes: ["name"],
        },
        {
          model: Mentor,
          attributes: ["name", "bio", "position", "image"],
        },
        {
          model: Organizers,
          attributes: ["name", "slug", "image"],
        },
        {
          model: EventFAQ,
          attributes: ["id", "question", "answer"],
        },
      ],
    });

    if (!result) {
      return null;
    }

    const registeredCount = await EventParticipantModel.count({
      where: {
        eventId: result.id,
      },
    });

    return {
      ...result.toJSON(),
      registered_count: registeredCount,
    };
  }

  static async getEventMonthlyStats() {
    const start = new Date(new Date().getFullYear(), 0, 1); // Jan 1
    const end = new Date(new Date().getFullYear() + 1, 0, 1); // Jan 1 next year

    const data = await Event.findAll({
      attributes: [
        [Sequelize.fn("MONTH", Sequelize.col("createdAt")), "month"],
        [Sequelize.fn("COUNT", Sequelize.col("id")), "total"],
      ],
      where: {
        createdAt: {
          [Op.gte]: start,
          [Op.lt]: end,
        },
      },
      group: [Sequelize.fn("MONTH", Sequelize.col("createdAt"))],
      order: [[Sequelize.fn("MONTH", Sequelize.col("createdAt")), "ASC"]],
      raw: true,
    });

    return data;
  }

  static async getParticipantsMonthlyStats() {
    const start = new Date(new Date().getFullYear(), 0, 1);
    const end = new Date(new Date().getFullYear() + 1, 0, 1);

    const data = await EventParticipantModel.findAll({
      attributes: [
        [Sequelize.fn("MONTH", Sequelize.col("createdAt")), "month"],
        [Sequelize.fn("COUNT", Sequelize.col("id")), "total"],
      ],
      where: {
        createdAt: {
          [Op.gte]: start,
          [Op.lt]: end,
        },
      },
      group: [Sequelize.fn("MONTH", Sequelize.col("createdAt"))],
      order: [[Sequelize.fn("MONTH", Sequelize.col("createdAt")), "ASC"]],
      raw: true,
    });
    return data;
  }

  static async getUpcomingEvents({
    limit = 5,
    organizerId,
  }: {
    limit?: number;
    organizerId?: number;
  }) {
    const now = new Date();

    const where: any = {
      startAt: {
        [Op.gt]: now,
      },
    };

    if (organizerId !== undefined) {
      where.organizerId = organizerId;
    }

    const events = await Event.findAll({
      where,
      include: [
        {
          model: Category,
          attributes: ["id", "name"],
        },
        {
          model: Mentor,
          attributes: ["id", "name"],
        },
        {
          model: EventStatus,
          as: "status",
          attributes: ["id", "code", "name"],
          where: {
            code: {
              [Op.notIn]: ["ended", "cancelled"],
            },
          },
          required: true,
        },
      ],
      order: [["startAt", "ASC"]],
      limit,
    });

    return events;
  }

  static async joinEventService(
    userId: number,
    eventId: number,
    ticketCode: string,
  ) {
    const event = await Event.findByPk(eventId);
    if (!event) {
      throw new NotFoundError("Event not found!");
    }

    try {
      await EventParticipantModel.create({
        userId,
        eventId,
        ticketCode,
      });
    } catch (err) {
      if (err instanceof UniqueConstraintError) {
        throw new BadRequestError("User already joined!");
      }
      throw err;
    }

    return true;
  }

  static async CreateEventService(
    title: string,
    location: string,
    description: string,
    startAtRaw: string,
    endAtRaw: string,
    mentorId: number,
    statusId: number,
    categoryId: number,
    capacity: number,
    image: File,
    locationType: string,
    meetingLink: string,
    priceType: string,
    price: number,
  ) {
    const slug = generateSlug(title);

    if (!title) {
      throw new BadRequestError("Title is required!");
    }

    if (!description) {
      throw new BadRequestError("Description is required!");
    }

    if (!locationType || !["offline", "online"].includes(locationType)) {
      throw new BadRequestError("Location type is required!");
    }

    if (!priceType || !["free", "paid"].includes(priceType)) {
      throw new BadRequestError("Price type is required!");
    }

    if (locationType === "offline" && !location) {
      throw new BadRequestError("Location is required!");
    }

    if (locationType === "online" && !meetingLink) {
      throw new BadRequestError("Meeting link is required!");
    }

    if (priceType == "paid" && !price) {
      throw new BadRequestError("Price is required!");
    }

    if (!startAtRaw || typeof startAtRaw !== "string") {
      throw new BadRequestError("StartAt is required!");
    }

    if (!endAtRaw || typeof endAtRaw !== "string") {
      throw new BadRequestError("EndAt is required!");
    }

    const startAt = new Date(startAtRaw);
    const endAt = new Date(endAtRaw);

    if (isNaN(endAt.getTime()) || isNaN(startAt.getTime())) {
      throw new BadRequestError("Datetime is invalid!");
    }

    const finalLocation = locationType === "offline" ? location : null;
    const finalMeetingLink = locationType === "online" ? meetingLink : null;

    let imagePath;

    if (image) {
      if (!image.type.startsWith("image/")) {
        throw new BadRequestError("File must be image!");
      }
      if (image.size > 2_000_000) {
        throw new BadRequestError("Image max size 2MB");
      }
      const uploaded = await saveImage(image);
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
      slug,
      statusId,
      capacity,
      priceType,
      price,
    });

    return event;
  }

  static async UpdateEventService(
    id: number,
    title: string,
    location: string,
    description: string,
    startAt: string,
    endAt: string,
    image: File,
    statusId: number,
    mentorId: number,
    categoryId: number,
    capacity: number,
    locationType: string,
    meetingLink: string,
    priceType: string,
    price: number,
  ) {
    if (!startAt || !endAt) {
      throw new BadRequestError("Datetime is required!");
    }

    const event = await Event.findByPk(id);
    if (!event) {
      throw new NotFoundError("Event not found");
    }

    if (title) event.title = title;
    if (location) event.location = location;
    if (description) event.description = description;
    const startAtNew = new Date(startAt);
    const endAtNew = new Date(endAt);
    if (startAt) event.startAt = startAtNew;
    if (endAt) event.endAt = endAtNew;
    if (meetingLink) event.meetingLink = meetingLink;
    if (price) event.price = price;
    if (statusId) event.statusId = statusId;
    if (categoryId) event.categoryId = categoryId;
    if (mentorId) event.mentorId = mentorId;
    if (capacity) event.capacity = capacity;

    if (image && image.size > 0) {
      const uploaded = await saveImage(image);
      event.image = uploaded.secure_url;
    }

    if (typeof priceType === "string" && priceType !== "") {
      if (!["free", "paid"].includes(priceType)) {
        throw new BadRequestError("PriceType is not valid!");
      }
      event.priceType = priceType as "free" | "paid";
    }

    if (typeof locationType === "string" && locationType !== "") {
      if (!["offline", "online"].includes(locationType)) {
        throw new Error("locationType tidak valid");
      }
      event.locationType = locationType as "offline" | "online";
    }

    await event.save();

    return event;
  }
}

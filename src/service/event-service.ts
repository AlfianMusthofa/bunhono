import { sequelize } from "../config/database";
import { Category } from "../models/category.model";
import { Event } from "../models/event.model";
import { EventStatus } from "../models/eventStatus.model";
import { Mentor } from "../models/mentor.model";
import { EventParticipantModel } from "../models/eventParticipant.model";
import { Op, Sequelize } from "sequelize";
import { saveImage } from "../utils/upload";

interface EventProps {
  limit?: number;
  page?: number;
  id?: number;
  slug?: string;
}

export const getAllEventsFunction = async ({
  limit = 10,
  page = 1,
  status,
  category,
  search,
}: {
  limit?: number;
  page?: number;
  status?: string;
  category?: string;
  search?: string;
}) => {
  const offset = (page - 1) * limit;

  const where: any = {};

  // 🔍 SEARCH TITLE
  if (search) {
    where.title = {
      [Op.like]: `%${search}%`,
    };
  }

  // 🏷️ CATEGORY FILTER
  if (category) {
    const categoryId = Number(category);
    if (!Number.isNaN(categoryId)) {
      where.categoryId = categoryId;
    }
  }

  // 📄 QUERY DATA
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
    ],
    attributes: {
      include: [
        [
          Sequelize.fn("COUNT", Sequelize.col("EventParticipantModels.id")),
          "registered_count",
        ],
      ],
    },
    group: ["Event.id", "Category.id", "Mentor.id", "status.id"],
    order: [["startAt", "ASC"]],
    limit,
    offset,
    subQuery: false,
  });

  // 📊 COUNT TOTAL (tanpa limit & offset)
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
};

export const getEventByIdFunction = async ({ id }: EventProps) => {
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
        attributes: [],
      },
    ],
    group: ["Event.id", "Category.id", "Mentor.id"],
  });

  return event;
};

export const getEventBySlugService = async ({ slug }: EventProps) => {
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
    ],
  });

  return result;
};

export const getEventMonthlyStats = async () => {
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
};

export const getParticipantsMonthlyStats = async () => {
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
};

// UPCOMING EVENTS

export const getUpcomingEvents = async ({ limit = 5 }: { limit?: number }) => {
  const now = new Date();

  const events = await Event.findAll({
    where: {
      startAt: {
        [Op.gt]: now,
      },
    },
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
};

export const joinEventService = async (userId: number, eventId: number) => {
  const event = await Event.findByPk(eventId);
  if (!event) {
    throw new Error("EVENT_NOT_FOUND");
  }
  const exist = await EventParticipantModel.findOne({
    where: { userId, eventId },
  });
  if (exist) {
    throw new Error("USER_ALREADY_JOINED");
  }
  await EventParticipantModel.create({ userId, eventId });
  return true;
};

type UpdateEventInput = {
  id: number;
  title?: string;
  location?: string;
  description?: string;
  startAt?: Date;
  endAt?: Date;
  imageEventNew?: File;
  statusIdRaw?: number;
  categoryIdRaw?: number;
  mentorIdRaw?: number;
  capacityRaw?: number;
  meetingLinkRaw?: string;
  priceRaw?: number;
  priceTypeRaw?: string;
  locationTypeRaw?: string;
};

export const updateEventService = async (input: UpdateEventInput) => {
  const {
    id,
    title,
    location,
    description,
    startAt,
    endAt,
    imageEventNew,
    statusIdRaw,
    mentorIdRaw,
    capacityRaw,
    categoryIdRaw,
    meetingLinkRaw,
    priceRaw,
    priceTypeRaw,
    locationTypeRaw,
  } = input;

  if (!startAt && !endAt) {
    throw new Error("STARTAT_ENDAT_REQUIRED");
  }

  const event = await Event.findByPk(id);

  if (!event) {
    throw new Error("EVENT_NOT_FOUND");
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

  if (statusIdRaw !== undefined && statusIdRaw !== null) {
    const statusIdNew = Number(statusIdRaw);
    if (Number.isNaN(statusIdNew)) {
      throw new Error("Status Id tidak valid");
    }
    event.statusId = statusIdNew;
  }

  if (categoryIdRaw !== undefined && categoryIdRaw !== null) {
    const categoryIdNew = Number(categoryIdRaw);
    if (Number.isNaN(categoryIdNew)) {
      throw new Error("Category Id tidak valid");
    }
    event.categoryId = categoryIdNew;
  }

  if (mentorIdRaw !== undefined && mentorIdRaw !== null) {
    const mentorIdNew = Number(mentorIdRaw);
    if (Number.isNaN(mentorIdNew)) {
      throw new Error("Mentor Id tidak valid");
    }
    event.mentorId = mentorIdNew;
  }

  if (capacityRaw !== undefined && capacityRaw !== null) {
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
};

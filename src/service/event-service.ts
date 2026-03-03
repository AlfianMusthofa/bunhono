import { sequelize } from "../config/database";
import { Category } from "../models/category.model";
import { Event } from "../models/event.model";
import { EventStatus } from "../models/eventStatus.model";
import { Mentor } from "../models/mentor.model";
import { EventParticipantModel } from "../models/eventParticipant.model";
import { Op, Sequelize } from "sequelize";

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
    order: [["startAt", "DESC"]],
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

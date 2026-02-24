import { sequelize } from "../config/database";
import { Category } from "../models/category.model";
import { Event } from "../models/event.model";
import { EventStatus } from "../models/eventStatus.model";
import { Mentor } from "../models/mentor.model";
import { EventParticipantModel } from "../models/eventParticipant.model";
import { Sequelize } from "sequelize";

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
}: {
  limit?: number;
  page?: number;
  status?: string;
}) => {
  const offset = (page - 1) * limit;

  const where: any = {};
  const include: any[] = [
    { model: Category, attributes: ["name"] },
    { model: Mentor, attributes: ["name"] },
    {
      model: EventStatus,
      as: "status",
      attributes: ["code", "name"],
      ...(status && { where: { code: status } }),
    },
    {
      model: EventParticipantModel,
      attributes: [],
    },
  ];

  const { rows, count } = await Event.findAndCountAll({
    where,
    limit,
    offset,
    order: [["startAt", "DESC"]],
    include,
    attributes: {
      include: [
        [
          Sequelize.fn("COUNT", Sequelize.col("EventParticipantModels.id")),
          "registered_count",
        ],
      ],
    },
    group: ["Event.id", "Category.id", "Mentor.id", "status.id"], // penting agar COUNT benar
    subQuery: false,
  });

  const totalCountResult = await Event.count({ where });

  //   return {
  //     rows,
  //     count,
  //     page,
  //     limit,
  //     totalPages: Math.ceil(count / limit),
  //   };

  return {
    rows,
    count: totalCountResult,
    page,
    limit,
    totalPages: Math.ceil(totalCountResult / limit),
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

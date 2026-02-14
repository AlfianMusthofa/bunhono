import { Category } from "../models/category.model";
import { Event } from "../models/event.model";
import { Mentor } from "../models/mentor.model";

interface EventProps {
  limit?: number;
  page?: number;
  id?: number;
}

export const getAllEventsFunction = async ({
  limit = 1,
  page = 10,
}: EventProps) => {
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

  return { rows, count, page, limit, totalPages: Math.ceil(count / limit) };
};

export const getEventByIdFunction = async ({ id }: EventProps) => {
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

  return event;
};

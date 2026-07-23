import { Category } from "../models/category.model";
import { Event } from "../models/event.model";
import { Op } from "sequelize";
import { Mentor } from "../models/mentor.model";

export class EventService {
  static async getEventsByDateRange(start: Date, end: Date) {
    return Event.findAll({
      where: {
        startAt: {
          [Op.between]: [start, end],
        },
      },
      order: [["startAt", "ASC"]],
      attributes: [
        "title",
        "description",
        "startAt",
        "endAt",
        "location",
        "locationType",
        "priceType",
      ],
    });
  }

  static async getEventBySlug(slug: string) {
    return Event.findOne({
      where: {
        slug,
      },
      attributes: [
        "title",
        "description",
        "startAt",
        "endAt",
        "location",
        "locationType",
        "priceType",
        "capacity",
      ],
      include: [
        {
          model: Category,
          attributes: ["name"],
        },
        {
          model: Mentor,
          attributes: ["name", "position", "biography"],
        },
      ],
    });
  }
}

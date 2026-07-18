import { Event } from "../models/event.model";
import { Op } from "sequelize";

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
}

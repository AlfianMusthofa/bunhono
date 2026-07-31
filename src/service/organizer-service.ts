import { Op } from "sequelize";
import { Organizers } from "../models/organizers.model";
import { Event } from "../models/event.model";
import { Category } from "../models/category.model";
import { EventStatus } from "../models/eventStatus.model";
import { Mentor } from "../models/mentor.model";

export class OrganizerService {
  static async getAllOrganizerFunc({
    limit = 10,
    page = 1,
    search,
  }: {
    search?: string;
    limit?: number;
    page?: number;
  }) {
    const offset = (page - 1) * limit;
    const where: any = {};

    if (search) {
      where.name = {
        [Op.like]: `%${search}%`,
      };
    }

    const rows = await Organizers.findAll({
      where,
      include: [
        {
          model: Event,
        },
      ],
      limit,
      offset,
      subQuery: false,
    });

    const count = await Organizers.count({
      where,
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

  static async getOrganizerBySlugService({ slug }: any) {
    const result = await Organizers.findOne({
      where: { slug },
      include: {
        model: Event,
      },
    });

    if (!result) {
      return null;
    }

    const total_events = await Event.count({
      where: {
        organizerId: result.id,
      },
    });

    return {
      ...result.toJSON(),
      total_events,
    };
  }

  static async getUpcomingEvents({
    limit = 5,
    organizerSlug,
  }: {
    limit?: number;
    organizerSlug?: string;
  }) {
    const now = new Date();

    const events = await Event.findAll({
      where: {
        startAt: {
          [Op.gt]: now,
        },
      },
      include: [
        {
          model: Organizers,
          ...(organizerSlug && {
            where: {
              slug: organizerSlug,
            },
            required: true,
          }),
        },
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
}

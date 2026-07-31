import type { Context } from "hono";
import { OrganizerService } from "../service/organizer-service";

export class OrganizerController {
  static async getAllOrganizer(c: Context) {
    const limit = Number(c.req.query("limit")) || 10;
    const page = Number(c.req.query("page")) || 1;
    const search = c.req.query("search");

    const result = await OrganizerService.getAllOrganizerFunc({
      limit,
      page,
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
  }

  static async getOrganizerBySlug(c: Context) {
    const slug = c.req.param("slug");
    try {
      const result = await OrganizerService.getOrganizerBySlugService({ slug });
      return c.json(result);
    } catch (error) {
      return c.json(error.message);
    }
  }

  static async getUpcomingEventsController(c: Context) {
    const limit = Number(c.req.query("limit")) || 5;
    const organizerSlug = c.req.param("slug");
    console.log(organizerSlug);

    const events = await OrganizerService.getUpcomingEvents({
      limit,
      organizerSlug,
    });

    return c.json({
      data: events,
    });
  }
}

import type { Context } from "hono";
import { askGemini } from "../service/gemini.ts";
import { EventService } from "../service/event-ai-service.ts";
import { getDateRange } from "../utils/date-range.ts";

export class AIController {
  static async chat(c: Context) {
    const { message } = await c.req.json();

    const range = getDateRange(message);

    if (range) {
      const events = await EventService.getEventsByDateRange(
        range.start,
        range.end,
      );

      const context =
        events.length === 0
          ? "Tidak ada event pada periode tersebut."
          : events
              .map(
                (event) => `
Nama Event : ${event.title}
Mulai : ${new Date(event.startAt).toLocaleString("id-ID")}
Selesai : ${new Date(event.endAt).toLocaleString("id-ID")}
Lokasi : ${event.location}
Jenis : ${event.locationType}
Harga : ${event.priceType}
`,
              )
              .join("\n----------------\n");

      const reply = await askGemini(message, context);

      return c.json({
        success: true,
        reply,
      });
    }

    const reply = await askGemini(message);

    return c.json({
      success: true,
      reply,
    });
  }

  static async eventChat(c: Context) {
    try {
      const slug = c.req.param("slug");
      const { message } = await c.req.json();
      const event = await EventService.getEventBySlug(slug);

      if (!event) {
        return c.json(
          {
            success: false,
            message: "Event not found!",
          },
          404,
        );
      }

      const context = `
      Informasi Event

      Nama Event:
      ${event.title}

      Deskripsi:
      ${event.description}

      Tanggal Mulai:
      ${new Date(event.startAt).toLocaleString("id-ID")}

      Tanggal Selesai:
      ${new Date(event.endAt).toLocaleString("id-ID")}

      Lokasi:
      ${event.location}

      Tipe Lokasi:
      ${event.locationType}

      Harga:
      ${event.priceType}

      Kapasitas:
      ${event.capacity}

      Mentor:
      ${event.mentor?.name}

      Mentor:
      ${event.category?.name}

      `;

      const reply = await askGemini(message, context);
      return c.json({
        success: true,
        reply,
      });
    } catch (error) {
      console.error(error);
      return c.json(
        {
          success: false,
          message: "Internal server error",
        },
        500,
      );
    }
  }
}

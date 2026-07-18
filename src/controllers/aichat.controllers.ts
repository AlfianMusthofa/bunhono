import type { Context } from "hono";
import { askGemini } from "../service/gemini.ts";
import { EventService } from "../service/event-ai-service.ts";
import { getDateRange } from "../utils/date-range.ts";

export class AIController {
  static async chat(c: Context) {
    const { message } = await c.req.json();

    // Mendeteksi apakah pertanyaan mengandung periode waktu
    const range = getDateRange(message);

    // Jika ada periode waktu, ambil data event dari database
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

    // Pertanyaan umum
    const reply = await askGemini(message);

    return c.json({
      success: true,
      reply,
    });
  }
}

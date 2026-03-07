import type { Context } from "hono";
import { generateParticipantsReport } from "../service/report-service";

export const downloadParticipantsReport = async (c: Context) => {
  const eventId = Number(c.req.param("id"));

  const buffer = await generateParticipantsReport(eventId);

  return new Response(buffer, {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="participants-event-${eventId}.xlsx"`,
    },
  });
};

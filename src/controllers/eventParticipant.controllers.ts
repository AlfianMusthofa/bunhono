import type { Context } from "hono";
import { Event } from "../models/event.model";
import { User } from "../models/user.model";

export const getEventParticipants = async (c: Context) => {
  const eventId = Number(c.req.param("id"));

  const event = await Event.findByPk(eventId, {
    include: [
      {
        model: User,
        attributes: ["id", "name"],
        through: { attributes: [] },
      },
    ],
  });

  if (!event) {
    return c.json({ message: "Event not found!" }, 404);
  }

  return c.json({
    eventId: event?.id,
    participants: event?.Users,
  });
};

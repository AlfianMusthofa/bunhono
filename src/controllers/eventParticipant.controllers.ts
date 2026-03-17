import type { Context } from "hono";
import { Event } from "../models/event.model";
import { User } from "../models/user.model";
import { EventParticipantModel } from "../models/eventParticipant.model";

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

export const checkinParticipant = async (c: Context) => {
  const { ticketCode } = await c.req.json();

  const participant = await EventParticipantModel.findOne({
    where: { ticketCode },
  });

  if (!participant) {
    return c.json({ message: "Ticket not valid" }, 404);
  }

  if (participant.checkedInAt) {
    return c.json({ message: "Already check in" }, 400);
  }

  participant.checkedInAt = new Date();
  await participant.save();

  return c.json({ message: "Check In Success" }, 200);
};

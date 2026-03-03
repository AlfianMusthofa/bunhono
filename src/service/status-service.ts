import { EventStatus } from "../models/eventStatus.model";
import { Event } from "../models/event.model";

export const countEventByStatus = async (code: string) => {
  return Event.count({
    include: [
      {
        model: EventStatus,
        where: { code },
        as: "status",
      },
    ],
  });
};

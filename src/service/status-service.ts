import { EventStatus } from "../models/eventStatus.model";
import { Event } from "../models/event.model";
import { Op } from "sequelize";

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

export const updateEndedEventStatus = async () => {
  const endedStatus = await EventStatus.findOne({
    where: { code: "ended" },
  });
  if (!endedStatus) return;
  await Event.update(
    { statusId: endedStatus.id },
    {
      where: {
        endAt: {
          [Op.lte]: new Date(),
        },
        statusId: {
          [Op.ne]: endedStatus.id,
        },
      },
    },
  );
};

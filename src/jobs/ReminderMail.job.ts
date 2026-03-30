import cron from "node-cron";
import { Op } from "sequelize";
import { EventParticipantModel } from "../models/eventParticipant.model";
import { Event } from "../models/event.model";
import { User } from "../models/user.model";
import { SendReminderMail } from "../utils/ReminderMail";

cron.schedule("0 * * * *", async () => {
  console.log("Running reminder job...");

  try {
    const now = new Date();
    const startTomorrow = new Date(now);
    startTomorrow.setDate(now.getDate() + 1);
    startTomorrow.setHours(0, 0, 0, 0);

    const endTomorrow = new Date(now);
    endTomorrow.setDate(now.getDate() + 1);
    endTomorrow.setHours(23, 59, 59, 999);

    const participants = await EventParticipantModel.findAll({
      where: {
        reminder_sent: false,
      },
      include: [
        {
          model: Event,
          required: true,
          where: {
            startAt: {
              [Op.between]: [startTomorrow, endTomorrow],
            },
          },
        },
        {
          model: User,
          required: true,
        },
      ],
    });

    console.log(`Found ${participants.length} participants to notify`);

    for (const participant of participants) {
      const event = participant.Event;
      const user = participant.User;

      if (!event || !user) continue;

      await SendReminderMail({
        to: user.email,
        event: {
          eventName: event.title,
          eventDate: event.startAt,
        },
      });

      await participant.update({
        reminder_sent: true,
      });
    }
  } catch (error) {
    console.error("Error in reminder cron:", error);
  }
});

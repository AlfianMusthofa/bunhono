import * as XLSX from "xlsx";
import { EventParticipantModel } from "../models/eventParticipant.model";
import { User } from "../models/user.model";

export const generateParticipantsReport = async (eventId: number) => {
  const participants = await EventParticipantModel.findAll({
    where: { eventId },
    include: [
      {
        model: User,
        attributes: ["name", "email"],
      },
    ],
  });

  const data = participants.map((p, index) => ({
    No: index + 1,
    Name: p.User?.name || "",
    Email: p.User?.email || "",
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Participants");

  const buffer = XLSX.write(workbook, {
    type: "buffer",
    bookType: "xlsx",
  });

  return buffer;
};

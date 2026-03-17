import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database";
import type { User } from "./user.model";

export class EventParticipantModel extends Model {
  declare id: number;
  declare userId: number;
  declare eventId: number;
  declare ticketCode: string;
  declare checkedInAt: Date;
  declare User?: User;
}

EventParticipantModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    eventId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    ticketCode: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    checkedInAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "event_participants",
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["userId", "eventId"],
      },
    ],
  },
);

import { Model, DataTypes } from "sequelize";
import { sequelize } from "../config/database";

export class EventFAQ extends Model {
  declare id: number;
  declare eventId: number;
  declare question: string;
  declare answer: string;
}

EventFAQ.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    eventId: {
      type: DataTypes.INTEGER,
    },
    question: {
      type: DataTypes.STRING,
    },
    answer: {
      type: DataTypes.STRING,
    },
  },
  {
    sequelize,
    tableName: "event_faqs",
    timestamps: true,
  },
);

import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database";

export class EventStatus extends Model {
  declare id: number;
  declare code: string;
  declare name: string;
}

EventStatus.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    code: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "event_statuses",
    timestamps: false,
  },
);

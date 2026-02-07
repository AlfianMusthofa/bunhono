import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database";

export class Event extends Model {
  declare id: number;
  declare title: string;
  declare description: string;
  declare startAt: Date;
  declare location: string;
  declare category: number;
  declare mentor: number;
  declare image: string | null;
}

Event.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    startAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    location: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    category: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "categories",
        key: "id",
      },
    },
    mentor: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "mentors",
        key: "id",
      },
    },
    image: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "events",
    timestamps: true,
  },
);

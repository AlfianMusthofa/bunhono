import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database";
import type { Category } from "./category.model";
import type { Mentor } from "./mentor.model";
import type { User } from "./user.model";

export class Event extends Model {
  declare id: number;
  declare title: string;
  declare description: string;
  declare startAt: Date;
  declare location: string;
  declare categoryId: number;
  declare category?: Category;
  declare mentorId: number;
  declare mentor?: Mentor;
  declare image: string | null;
  declare Users?: User[];
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
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "categories",
        key: "id",
      },
    },
    mentorId: {
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

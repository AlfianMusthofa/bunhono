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
  declare slug: string;
  declare statusId: number;
  declare capacity: number;
  declare locationType: "online" | "offline";
  declare meetingLink: string;
  declare priceType: "free" | "paid";
  declare price: number;
  declare currency: number;
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
      type: DataTypes.TEXT,
      allowNull: false,
    },
    startAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    locationType: {
      type: DataTypes.ENUM("online", "offline"),
      allowNull: false,
    },
    location: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    meetingLink: {
      type: DataTypes.STRING,
      allowNull: true,
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
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    statusId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "event_statuses",
        key: "id",
      },
    },
    capacity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    priceType: {
      type: DataTypes.ENUM("free", "paid"),
      allowNull: false,
      defaultValue: "free",
    },
    price: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    currency: {
      type: DataTypes.STRING,
      defaultValue: "IDR",
    },
  },
  {
    sequelize,
    tableName: "events",
    timestamps: true,
  },
);

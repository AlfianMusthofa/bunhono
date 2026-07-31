import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database";

export class Organizers extends Model {
  declare id: number;
  declare name: string;
  declare about: string;
  declare slug: string;
  declare image: string;
  declare description: string;
  declare email: string;
  declare phone: string;
  declare website: string;
  declare location: string;
  declare instagram?: string;
  declare facebook?: string;
  declare youtube?: string;
  declare followers?: number;
  declare status: string;
}

Organizers.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    about: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    image: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    description: {
      type: DataTypes.STRING,
    },
    email: {
      type: DataTypes.STRING,
    },
    phone: {
      type: DataTypes.STRING,
    },
    website: {
      type: DataTypes.STRING,
    },
    location: {
      type: DataTypes.STRING,
    },
    instagram: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    facebook: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    youtube: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    followers: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING,
    },
  },
  {
    sequelize,
    tableName: "organizers",
    timestamps: true,
  },
);

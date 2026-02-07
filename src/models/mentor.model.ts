import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database";

export class Mentor extends Model {
  declare id: number;
  declare name: string;
  declare position: string;
  declare bio: string;
  declare image: string;
}

Mentor.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    position: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    bio: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    image: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: "mentors",
    sequelize,
    timestamps: true,
  },
);

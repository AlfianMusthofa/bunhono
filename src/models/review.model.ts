import { sequelize } from "../config/database";
import { DataTypes, Model } from "sequelize";

export class Review extends Model {
  declare id: number;
  declare userId: number;
  declare eventId: number;
  declare rating: number;
  declare content: string;
  declare image: string;
  declare User?: [];
  declare Event?: [];
}

Review.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    eventId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    image: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "reviews",
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["userId", "eventId"],
      },
    ],
  },
);

import { Model, DataTypes } from "sequelize";
import { sequelize } from "../config/database";

export class Like extends Model {
  declare id: number;
  declare userId: number;
  declare articleId: number;
}

Like.init(
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
    articleId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "likes",
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["userId", "articleId"],
      },
    ],
  },
);

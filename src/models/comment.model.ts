import { Model, DataTypes } from "sequelize";
import { sequelize } from "../config/database";

export class Comment extends Model {
  declare id: number;
  declare userId: number;
  declare articleId: number;
  declare content: string;
}

Comment.init(
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
    articleId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "comments",
    timestamps: true,
  },
);

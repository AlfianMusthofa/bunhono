import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database";

export class Tags extends Model {
  declare id: number;
  declare name: string;
}

Tags.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
    },
  },
  {
    sequelize,
    tableName: "tags",
    timestamps: true,
  },
);

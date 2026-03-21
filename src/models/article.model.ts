import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database";

export class Article extends Model {
  declare id: number;
  declare title: string;
  declare image: string;
  declare content: string;
  declare categoryId: number;
  declare slug: string;
  declare createdAt: Date;
  declare updatedAt: Date;
}

Article.init(
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
    image: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    tableName: "articles",
    sequelize,
    paranoid: true,
    timestamps: true,
  },
);

import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database";

export class ArticleTags extends Model {
  declare id: number;
  declare articleId: number;
  declare tagId: number;
}

ArticleTags.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    articleId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    tagId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "article_tags",
    timestamps: true,
  },
);

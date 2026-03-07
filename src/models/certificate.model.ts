import { Model, DataTypes } from "sequelize";
import { sequelize } from "../config/database";

export class Certificate extends Model {
  declare id: number;
  declare eventId: number;
  declare participantId: number;
  declare templatePath: string;
  declare certificatePath: string;
  declare issuedAt: Date;
}

Certificate.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    eventId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    participantId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    templatePath: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    certificatePath: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    issuedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "certificates",
    timestamps: true,
  },
);

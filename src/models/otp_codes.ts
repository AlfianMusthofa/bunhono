import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database";

export class OtpCodes extends Model {
  declare id: number;
  declare email: string;
  declare code: string;
  declare expiresAt: Date;
  declare isUsed: boolean;
}

OtpCodes.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    code: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    isUsed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    sequelize,
    tableName: "otp_codes",
    timestamps: true,
  },
);

import { Sequelize } from "sequelize";

export const sequelize = new Sequelize(
  process.env.DB_NAME!,
  process.env.DB_USER!,
  process.env.DB_PASS!,
  {
    host: "localhost",
    dialect: "mysql",
    logging: false,
  },
);

export const connectDb = async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connected");
  } catch (error) {
    console.error("Database not connected");
  }
};

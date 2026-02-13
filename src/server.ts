import app from "./app";
import { connectDb, sequelize } from "./config/database";
import "dotenv/config";
import "./models/assosiation";

const PORT = 3000;

(async () => {
  try {
    await connectDb();
    await sequelize.sync({ alter: true });
    console.log("🚀 Server starting...");
  } catch (err) {
    console.error("Startup error:", err);
  }
})();

export default {
  port: PORT,
  fetch: app.fetch,
};

import cron from "node-cron";
import { updateEndedEventStatus } from "../service/status-service";

cron.schedule(
  "0 * * * *",
  async () => {
    console.log("[CRON] Checking ended status...");
    await updateEndedEventStatus();
  },
  { timezone: "Asia/Jakarta" },
);

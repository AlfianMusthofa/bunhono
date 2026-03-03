import { Hono } from "hono";
import {
  activeStatus,
  cancelledStatus,
  endedStatus,
  getStatus,
  pendingStatus,
} from "../controllers/eventStatus";

const statusRoute = new Hono();

statusRoute.get("/", getStatus);
statusRoute.get("/count/active", activeStatus);
statusRoute.get("/count/pending", pendingStatus);
statusRoute.get("/count/ended", endedStatus);
statusRoute.get("/count/cancelled", cancelledStatus);

export default statusRoute;

import { Hono } from "hono";
import {
  createEvent,
  getAllEvents,
  getEventById,
  getEventBySlug,
  joinEvent,
  statusCount,
  updateEvent,
} from "../controllers/event.controllers";
import { authMiddleware } from "../middleware/auth.middleware";
import { getEventParticipants } from "../controllers/eventParticipant.controllers";

const eventRoute = new Hono();

eventRoute.post("/", createEvent);
eventRoute.get("/", getAllEvents);
eventRoute.put("/id/:id", updateEvent);
eventRoute.post("/:id/join", authMiddleware, joinEvent);
eventRoute.get("/:id", getEventById);
eventRoute.get("/:id/participants", getEventParticipants);
eventRoute.get("/slug/:slug", getEventBySlug);
eventRoute.get("/status/count", statusCount);

export default eventRoute;

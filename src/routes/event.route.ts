import { Hono } from "hono";
import {
  createEvent,
  getAllEvents,
  getEventById,
  joinEvent,
  updateEvent,
} from "../controllers/event.controllers";
import { authMiddleware } from "../middleware/auth.middleware";
import { getEventParticipants } from "../controllers/eventParticipant.controllers";

const eventRoute = new Hono();

eventRoute.post("/", authMiddleware, createEvent);
eventRoute.get("/", getAllEvents);
eventRoute.put("/:id", updateEvent);
eventRoute.post("/:id/join", authMiddleware, joinEvent);
eventRoute.get("/:id", getEventById);
eventRoute.get("/:id/participants", getEventParticipants);

export default eventRoute;

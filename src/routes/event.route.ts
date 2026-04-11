import { Hono } from "hono";
import {
  countUserHistory,
  createEvent,
  getAllEvents,
  getEventById,
  getEventBySlug,
  getEventMonthlyChart,
  getParticipantsMonthlyChart,
  getUpcomingEventsController,
  joinEvent,
  updateEvent,
} from "../controllers/event.controllers";
import { authMiddleware } from "../middleware/auth.middleware";
import {
  checkinParticipant,
  getEventParticipants,
} from "../controllers/eventParticipant.controllers";
import { getMyReview } from "../controllers/review.controllers";

const eventRoute = new Hono();

eventRoute.post("/", createEvent);
eventRoute.get("/", getAllEvents);
eventRoute.get("/upcoming", getUpcomingEventsController);
eventRoute.patch("/id/:id", updateEvent);
eventRoute.post("/:id/join", authMiddleware, joinEvent);
eventRoute.get("/:id", getEventById);
eventRoute.get("/:id/participants", getEventParticipants);
eventRoute.get("/slug/:slug", getEventBySlug);
eventRoute.get("/charts/monthly", getEventMonthlyChart);
eventRoute.get("/dashboard/participants/monthly", getParticipantsMonthlyChart);
eventRoute.get("/totalHistory", authMiddleware, countUserHistory);
eventRoute.post("/checkin", checkinParticipant);
eventRoute.get("/:eventId/my-review", authMiddleware, getMyReview);

export default eventRoute;

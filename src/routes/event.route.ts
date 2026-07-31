import { Hono } from "hono";
import { authMiddleware } from "../middleware/auth.middleware";
import {
  checkinParticipant,
  getEventParticipants,
} from "../controllers/eventParticipant.controllers";
import { getMyReview } from "../controllers/review.controllers";
import { EventContoller } from "../controllers/event.controllers";

const eventRoute = new Hono();

eventRoute.post("/", EventContoller.createEvent);
eventRoute.get("/", EventContoller.getAllEvents);
eventRoute.get("/upcoming", EventContoller.getUpcomingEventsController);
eventRoute.patch("/id/:id", EventContoller.updateEvent);
eventRoute.post("/:id/join", authMiddleware, EventContoller.joinEvent);
eventRoute.get("/:id", EventContoller.getEventById);
eventRoute.get("/:id/participants", getEventParticipants);
eventRoute.get("/slug/:slug", EventContoller.getEventBySlug);
eventRoute.get("/charts/monthly", EventContoller.getEventMonthlyChart);
eventRoute.get(
  "/dashboard/participants/monthly",
  EventContoller.getParticipantsMonthlyChart,
);
eventRoute.get(
  "/totalHistory",
  authMiddleware,
  EventContoller.countUserHistory,
);
eventRoute.post("/checkin", checkinParticipant);
eventRoute.get("/:eventId/my-review", authMiddleware, getMyReview);

export default eventRoute;

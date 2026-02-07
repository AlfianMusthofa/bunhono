import { Hono } from "hono";
import { createEvent, getAllEvents } from "../controllers/event.controllers";
import { authMiddleware } from "../middleware/auth.middleware";

const eventRoute = new Hono();

eventRoute.post("/", authMiddleware, createEvent);
eventRoute.get("/", authMiddleware, getAllEvents);

export default eventRoute;

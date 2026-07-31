import { OrganizerController } from "../controllers/organizer.controllers";
import { Hono } from "hono";

const route = new Hono();

route.get("/", OrganizerController.getAllOrganizer);
route.get("/slug/:slug", OrganizerController.getOrganizerBySlug);
route.get(
  "/:slug/events/upcoming",
  OrganizerController.getUpcomingEventsController,
);

export default route;

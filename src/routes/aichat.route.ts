import { Hono } from "hono";
import { AIController } from "../controllers/aichat.controllers";

const route = new Hono();

route.post("/chat", AIController.chat);
route.post("/events/:slug/ai", AIController.eventChat);

export default route;

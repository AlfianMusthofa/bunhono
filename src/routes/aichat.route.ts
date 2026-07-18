import { Hono } from "hono";
import { AIController } from "../controllers/aichat.controllers";

const route = new Hono();

route.post("/chat", AIController.chat);

export default route;

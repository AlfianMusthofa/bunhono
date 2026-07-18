import { Hono } from "hono";
import { sendContactEmail } from "../controllers/contact.controllers";

const emailRoute = new Hono();

emailRoute.post("/contact", sendContactEmail);

export default emailRoute;

import { addMentor, getAllMentors } from "../controllers/mentor.controllers";
import { Hono } from "hono";
import { authMiddleware } from "../middleware/auth.middleware";

const mentorRoute = new Hono();

mentorRoute.get("/", getAllMentors);
mentorRoute.post("/", addMentor);

export default mentorRoute;

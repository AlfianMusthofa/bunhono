import {
  addMentor,
  getAllMentors,
  updateMentor,
} from "../controllers/mentor.controllers";
import { Hono } from "hono";
import { authMiddleware } from "../middleware/auth.middleware";

const mentorRoute = new Hono();

mentorRoute.get("/", getAllMentors);
mentorRoute.post("/", addMentor);
mentorRoute.put("/:id", updateMentor);

export default mentorRoute;

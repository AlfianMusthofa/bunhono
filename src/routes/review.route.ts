import { Hono } from "hono";
import {
  getReviews,
  getReviewsByEvent,
  postReview,
} from "../controllers/review.controllers";
import { authMiddleware } from "../middleware/auth.middleware";

const route = new Hono();

route.get("/", getReviews);
route.get("/:eventId", getReviewsByEvent);
route.post("/:eventId", authMiddleware, postReview);

export default route;

import { Hono } from "hono";
import {
  getReviews,
  getReviewsByEvent,
  postReview,
  totalReview,
} from "../controllers/review.controllers";
import { authMiddleware } from "../middleware/auth.middleware";

const route = new Hono();

route.get("/", getReviews);
route.get("/total", authMiddleware, totalReview);
route.get("/:eventId", getReviewsByEvent);
route.post("/:eventId", authMiddleware, postReview);

export default route;

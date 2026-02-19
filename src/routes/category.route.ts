import {
  addCategory,
  getCategories,
  getCategoryEvents,
  getCategoryWithEvents,
} from "../controllers/category.controllers";
import { Hono } from "hono";

const categoryRoute = new Hono();

categoryRoute.post("/", addCategory);
categoryRoute.get("/", getCategories);
categoryRoute.get("/events", getCategoryWithEvents);
categoryRoute.get("/:id/events", getCategoryEvents);

export default categoryRoute;

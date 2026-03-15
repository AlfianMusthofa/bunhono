import {
  addCategory,
  getCategories,
  getCategoryEvents,
  getCategoryWithEvents,
} from "../controllers/category.controllers";
import { Hono } from "hono";

const categoryRoute = new Hono();

categoryRoute.get("/", getCategories);
categoryRoute.post("/", addCategory);
categoryRoute.get("/events", getCategoryWithEvents);
categoryRoute.get("/:id/events", getCategoryEvents);

export default categoryRoute;

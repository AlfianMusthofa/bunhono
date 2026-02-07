import { addCategory } from "../controllers/category.controllers";
import { Hono } from "hono";

const categoryRoute = new Hono();

categoryRoute.post("", addCategory);

export default categoryRoute;

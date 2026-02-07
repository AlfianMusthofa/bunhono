import { Hono } from "hono";
import { login } from "../controllers/auth.controllers";

const authRoute = new Hono();

authRoute.post("/login", login);

export default authRoute;

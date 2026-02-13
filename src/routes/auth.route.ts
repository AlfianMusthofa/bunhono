import { Hono } from "hono";
import { login, logout, refresh } from "../controllers/auth.controllers";
import { authMiddleware } from "../middleware/auth.middleware";

const authRoute = new Hono();

authRoute.post("/login", login);
authRoute.post("/refresh", authMiddleware, refresh);
authRoute.post("/logout", authMiddleware, logout);

export default authRoute;

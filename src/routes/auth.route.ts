import { Hono } from "hono";
import { login, logout, me, refresh } from "../controllers/auth.controllers";
import { authMiddleware } from "../middleware/auth.middleware";

const authRoute = new Hono();

authRoute.post("/login", login);
authRoute.post("/refresh", refresh);
authRoute.post("/logout", authMiddleware, logout);
authRoute.get("/me", authMiddleware, me);

export default authRoute;

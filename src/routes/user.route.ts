import { Hono } from "hono";
import { getUser } from "../controllers/user.controllers";
import { authMiddleware } from "../middleware/auth.middleware";

const userRoute = new Hono();

userRoute.get("/", authMiddleware, getUser);

export default userRoute;

import { Hono } from "hono";
import { getUser, register, update } from "../controllers/user.controllers";
import { authMiddleware } from "../middleware/auth.middleware";

const userRoute = new Hono();

userRoute.get("/", authMiddleware, getUser);
userRoute.post("/", register);
userRoute.patch("/", authMiddleware, update);

export default userRoute;

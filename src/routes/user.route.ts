import { Hono } from "hono";
import {
  getUser,
  getUserById,
  register,
  update,
} from "../controllers/user.controllers";
import { authMiddleware } from "../middleware/auth.middleware";

const userRoute = new Hono();

userRoute.get("/", authMiddleware, getUser);
userRoute.post("/", register);
userRoute.patch("/", authMiddleware, update);
userRoute.get("/:id", authMiddleware, getUserById);

export default userRoute;

import { Hono } from "hono";
import {
  getUser,
  getUserById,
  registerUserNew,
  updateUserNew,
  userEventHistory,
} from "../controllers/user.controllers";
import { authMiddleware } from "../middleware/auth.middleware";

const userRoute = new Hono();

userRoute.get("/", authMiddleware, getUser);
userRoute.post("/", registerUserNew);
userRoute.patch("/", authMiddleware, updateUserNew);
userRoute.get("/:id", authMiddleware, getUserById);
userRoute.get("/me/history", authMiddleware, userEventHistory);

export default userRoute;

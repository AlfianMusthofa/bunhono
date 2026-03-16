import { Hono } from "hono";
import {
  getUser,
  getUserById,
  registerUserNew,
  updateUserById,
  updateUserNew,
  userEventHistory,
} from "../controllers/user.controllers";
import { authMiddleware } from "../middleware/auth.middleware";

const userRoute = new Hono();

userRoute.get("/", getUser);
userRoute.post("/register", registerUserNew);
userRoute.patch("/", updateUserNew);
userRoute.patch("/:id", updateUserById);
userRoute.get("/:id", getUserById);
userRoute.get("/me/history", authMiddleware, userEventHistory);

export default userRoute;

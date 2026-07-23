import { Hono } from "hono";
import { authMiddleware } from "../middleware/auth.middleware";
import { AuthController } from "../controllers/auth.controllers";

const authRoute = new Hono();

authRoute.post("/login", AuthController.login);
authRoute.post("/refresh", AuthController.refresh);
authRoute.post("/send-otp", AuthController.sendOTPReg);
authRoute.post("/verify-otp", AuthController.verifyOTP);
authRoute.post("/logout", authMiddleware, AuthController.logout);
authRoute.get("/me", authMiddleware, AuthController.me);

export default authRoute;

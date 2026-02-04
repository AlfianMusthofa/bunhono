import type { Context, Next } from "hono";
import { verifyToken } from "../utils/jwt";

export const authMiddleware = async (c: Context, next: Next) => {
  const authHeader = c.req.header("authorization");
  if (!authHeader) {
    return c.json({ message: "Unauthorized" }, 401);
  }

  if (!authHeader.startsWith("Bearer ")) {
    return c.json(
      {
        message: "Unauthorized",
      },
      401,
    );
  }

  const token = authHeader.replace("Bearer ", "").trim();

  try {
    const decoded = verifyToken(token);
    c.set("user", decoded);
    await next();
  } catch (error) {
    return c.json({ message: "Invalid Token" }, 401);
  }
};

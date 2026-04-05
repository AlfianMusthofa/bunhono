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

export const optionalAuth = async (c: Context, next: Next) => {
  const authHeader = c.req.header("Authorization");

  if (authHeader) {
    try {
      const token = authHeader.split(" ")[1];
      const decoded = verifyToken(token); // jwt verify

      c.set("user", decoded);
    } catch (err) {
      // token invalid → abaikan
    }
  }

  await next();
};

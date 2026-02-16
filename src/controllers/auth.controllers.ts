import type { Context } from "hono";
import bcrypt from "bcryptjs";
import { User } from "../models/user.model";
import { loginSchema } from "../validators/auth.validator";
import { signRefreshToken, signToken, verifyRefreshToken } from "../utils/jwt";
import crypto from "crypto";
import { RefreshToken } from "../models/refreshToken.model";

export const login = async (c: Context) => {
  const body = await c.req.json();
  const data = loginSchema.parse(body);

  const user = await User.findOne({
    where: {
      email: data.email,
    },
  });

  if (!user) {
    return c.json({ message: "Email or Password Invalid!" }, 401);
  }

  const match = await bcrypt.compare(data.password, user.password);

  if (!match) {
    return c.json({ message: "Email or Password Invalid!" }, 401);
  }

  const payload = {
    id: user.id,
    email: user.email,
  };

  const accessToken = signToken(payload);
  const refreshToken = signRefreshToken(payload);

  const tokenHash = crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");

  await RefreshToken.create({
    userId: user.id,
    tokenHash,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  return c.json({
    message: "Login Success",
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
    accessToken,
    refreshToken,
  });
};

export const refresh = async (c: Context) => {
  const { refreshToken } = await c.req.json();

  if (!refreshToken) {
    return c.json({ message: "Refresh token required" }, 401);
  }

  const payload = verifyRefreshToken(refreshToken);

  const tokenHash = crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");

  const stored = await RefreshToken.findOne({
    where: {
      userId: payload.id,
      tokenHash,
    },
  });

  if (!stored) {
    return c.json({ message: "Invalid refresh token" }, 401);
  }

  const newAccessToken = signToken({
    id: payload.id,
    email: payload.email,
  });

  return c.json({ accessToken: newAccessToken });
};

export const logout = async (c: Context) => {
  const { refreshToken } = await c.req.json();

  const tokenHash = crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");

  await RefreshToken.destroy({
    where: { tokenHash },
  });

  return c.json({ message: "Logout success" });
};

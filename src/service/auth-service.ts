import { RefreshToken } from "../models/refreshToken.model";
import type { User } from "../models/user.model";
import { signRefreshToken, signToken } from "../utils/jwt";
import crypto from "crypto";

export const createAuthSession = async (user: User) => {
  const payload = {
    id: user.id,
    email: user.email,
    image: user.image,
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

  return {
    accessToken,
    refreshToken,
  };
};

import type { Context } from "hono";
import bcrypt from "bcryptjs";
import { User } from "../models/user.model";
import { loginSchema } from "../validators/auth.validator";
import { signRefreshToken, signToken, verifyRefreshToken } from "../utils/jwt";
import crypto from "crypto";
import { RefreshToken } from "../models/refreshToken.model";
import { generateOTP, sendOTP } from "../service/OTPService";
import { OtpCodes } from "../models/otp_codes";
import { RegisterUserServive } from "../service/user-service";
import { createAuthSession } from "../service/auth-service";

export class AuthController {
  static async login(c: Context) {
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
    console.log(match);
    if (!match) {
      return c.json({ message: "Password Invalid!" }, 401);
    }

    const { accessToken, refreshToken } = await createAuthSession(user);

    return c.json({
      message: "Login Success",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
      },
      accessToken,
      refreshToken,
    });
  }

  static async logout(c: Context) {
    const authUser = c.get("user") as { id: number };
    const { refreshToken } = await c.req.json();

    const tokenHash = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");

    await RefreshToken.destroy({
      where: {
        userId: authUser.id,
        tokenHash,
      },
    });

    return c.json({ message: "Logout success" });
  }

  static async refresh(c: Context) {
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

    if (stored.expiresAt < new Date()) {
      await stored.destroy();
      return c.json({ message: "Refresh token expired" }, 401);
    }

    const newAccessToken = signToken({
      id: payload.id,
      email: payload.email,
    });

    return c.json({ accessToken: newAccessToken });
  }

  static async me(c: Context) {
    const authUser = c.get("user") as { id: number };

    if (!authUser?.id) {
      return c.json({ message: "Unauthorized" }, 401);
    }

    const user = await User.findByPk(authUser.id, {
      attributes: ["id", "name", "email", "image"],
    });

    if (!user) {
      return c.json({ message: "User not found" }, 404);
    }

    return c.json(user);
  }

  static async sendOTPReg(c: Context) {
    try {
      const { email } = await c.req.json();
      const otp = generateOTP();

      const existingEmail = await User.findOne({
        where: { email },
      });

      if (existingEmail) {
        return c.json(
          {
            success: false,
            message: "Email already registered.",
          },
          400,
        );
      }

      await OtpCodes.destroy({
        where: {
          email,
          isUsed: false,
        },
      });

      await OtpCodes.create({
        email,
        code: otp,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      });

      await sendOTP(email, otp);

      return c.json({
        success: true,
        message: "OTP has been send!",
      });
    } catch (error) {
      console.log(error);
      return c.json({
        success: false,
        message: "OTP failed",
      });
    }
  }

  static async verifyOTP(c: Context) {
    try {
      const { name, email, password, otp } = await c.req.json();

      const otpData = await OtpCodes.findOne({
        where: {
          email,
          code: otp,
          isUsed: false,
        },
        order: [["createdAt", "DESC"]],
      });

      if (!otpData) {
        return c.json(
          {
            success: false,
            message: "OTP is not valid!",
          },
          400,
        );
      }

      if (otpData.expiresAt < new Date()) {
        return c.json(
          {
            success: false,
            message: "OTP is not valid!",
          },
          400,
        );
      }

      const user = await RegisterUserServive(name, email, password);

      otpData.isUsed = true;
      await otpData.save();

      const { accessToken, refreshToken } = await createAuthSession(user);

      return c.json({
        message: "Register Success",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
        },
        accessToken,
        refreshToken,
      });
    } catch (error) {
      console.error(error);
      return c.json(
        {
          success: false,
          message: "Something wrong!",
        },
        500,
      );
    }
  }
}

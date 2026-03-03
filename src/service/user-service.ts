import bcrypt from "bcryptjs";
import { Event } from "../models/event.model";
import { User } from "../models/user.model";
import { Op } from "sequelize";

export const getAllUsers = async (search?: string) => {
  const where = search
    ? {
        [Op.or]: [
          { name: { [Op.like]: `%${search}%` } },
          { email: { [Op.like]: `%${search}%` } },
        ],
      }
    : {};

  const users = await User.findAll({ where });

  return {
    total: users.length,
    data: users,
  };
};

export const getSingleUserById = async (id: number) => {
  return User.findByPk(id, {
    attributes: ["id", "name", "email"],
    include: [
      {
        model: Event,
        attributes: ["id", "title", "location"],
        through: { attributes: [] },
      },
    ],
  });
};

export const registerUser = async (data: {
  name: string;
  email: string;
  password: string;
}) => {
  const exist = await User.findOne({
    where: { email: data.email },
  });

  if (exist) {
    throw new Error("EMAIL_EXISTS");
  }

  const hashed = await bcrypt.hash(data.password, 10);

  const register = await User.create({
    name: data.name,
    email: data.email,
    password: hashed,
  });

  return register;
};

import bcrypt from "bcryptjs";
import { Event } from "../models/event.model";
import { User } from "../models/user.model";
import { Op } from "sequelize";
import { EventStatus } from "../models/eventStatus.model";
import { Certificate } from "../models/certificate.model";
import { saveImage } from "../utils/upload";
import { NotFoundError } from "../errors/NotFoundError";
import { BadRequestError } from "../errors/BadRequestError";

export const getAllUsers = async (
  search?: string,
  page: number = 1,
  limit: number = 10,
) => {
  const offset = (page - 1) * limit;
  const where = search
    ? {
        [Op.or]: [
          { name: { [Op.like]: `%${search}%` } },
          { email: { [Op.like]: `%${search}%` } },
        ],
      }
    : {};

  const { rows, count } = await User.findAndCountAll({
    where,
    limit,
    offset,
    order: [["createdAt", "DESC"]],
  });

  return {
    data: rows,
    meta: {
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit),
    },
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

export const UserEventHistoryService = async (
  search?: string,
  page: number = 1,
  limit: number = 10,
  id?: number,
) => {
  const offset = (page - 1) * limit;
  const where = search
    ? {
        title: {
          [Op.like]: `%${search}%`,
        },
      }
    : {};

  if (!id || isNaN(id)) {
    throw new BadRequestError("Invalid Id!");
  }

  const user = await User.findByPk(id, {
    attributes: ["id", "name", "image"],
  });

  if (!user) {
    throw new NotFoundError("User not found!");
  }

  const { rows, count } = await Event.findAndCountAll({
    include: [
      {
        model: User,
        where: { id: id },
        attributes: [],
        through: { attributes: [] },
      },
      {
        model: EventStatus,
        attributes: ["name"],
        as: "status",
      },
      {
        model: Certificate,
        attributes: ["id", "templatePath"],
        where: {
          participantId: null,
        },
        required: false,
      },
    ],
    where,
    limit,
    offset,
    order: [["startAt", "ASC"]],
  });
  const totalPage = Math.ceil(count / limit);

  return {
    user: {
      id: user?.id,
      name: user?.name,
      image: user?.image,
    },
    data: rows,
    meta: {
      total: count,
      page,
      limit,
      totalPage,
    },
  };
};

export const UpdateUserService = async (
  id?: number,
  name?: string,
  email?: string,
  password?: string,
  image?: File,
) => {
  if (!id || isNaN(id)) {
    throw new BadRequestError("Invalid Id");
  }

  const user = await User.findByPk(id);

  if (!user) {
    throw new NotFoundError("User not found!");
  }

  if (name) user.name = name;
  if (email) user.email = email;

  if (password) {
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
  }

  if (image && image.size > 0) {
    const uploaded = await saveImage(image);
    user.image = uploaded.secure_url;
  }

  await user.save();

  return user;
};

export const RegisterUserServive = async (
  name: string,
  email: string,
  password: string,
) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  const existingEmail = await User.findOne({
    where: { email },
  });
  if (existingEmail) {
    throw new BadRequestError("Email already exist");
  }
  const user = await User.create({
    name,
    email,
    password: hashedPassword,
  });

  return user;
};

export const UpdateUserByIdService = async (
  id: number,
  name: string,
  email: string,
  password: string,
  image: File,
) => {
  const user = await User.findByPk(id);
  if (!user) {
    throw new NotFoundError("User not found!");
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  if (name) user.name = name;
  if (email) user.email = email;
  if (password) user.password = hashedPassword;
  if (image && image.size > 0) {
    const upload = await saveImage(image);
    user.image = upload.secure_url;
  }
  await user.save();
  return true;
};

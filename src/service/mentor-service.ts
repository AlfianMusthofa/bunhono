import { Op } from "sequelize";
import { Mentor } from "../models/mentor.model";
import { BadRequestError } from "../errors/BadRequestError";
import { saveImage } from "../utils/upload";
import { NotFoundError } from "../errors/NotFoundError";

export const GetAllMentorsService = async (
  limit: number = 5,
  page: number = 1,
  search?: string,
) => {
  const offset = (page - 1) * limit;
  const where = search
    ? {
        name: {
          [Op.like]: `%${search}%`,
        },
      }
    : {};

  const { rows, count } = await Mentor.findAndCountAll({
    where,
    limit,
    offset,
    order: [["createdAt", "DESC"]],
  });

  const totalPages = Math.ceil(count / limit);

  return {
    data: rows,
    meta: {
      total: count,
      page,
      limit,
      totalPages,
    },
  };
};

export const AddMentorService = async (
  name: string,
  position: string,
  bio: string,
  image: File,
) => {
  let imagePath;

  if (!name || !position) {
    throw new BadRequestError("Name or position is required");
  }

  if (image && image.size > 0) {
    const uploaded = await saveImage(image);
    imagePath = uploaded.secure_url;
  }

  const mentor = await Mentor.create({
    name,
    position,
    bio,
    image: imagePath,
  });

  return mentor;
};

export const UpdateMentorService = async (
  id: number,
  name?: string,
  position?: string,
  bio?: string,
  image?: File,
) => {
  const mentor = await Mentor.findByPk(id);
  if (!mentor) {
    throw new NotFoundError("Mentor not found!");
  }

  if (name) mentor.name = name;
  if (position) mentor.position = position;
  if (bio) mentor.bio = bio;

  if (image && image.size > 0) {
    const uploaded = await saveImage(image);
    mentor.image = uploaded.secure_url;
  }

  await mentor.save();

  return true;
};

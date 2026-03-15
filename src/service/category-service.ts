import { Op } from "sequelize";
import { Category } from "../models/category.model";
import { Event } from "../models/event.model";

export const GetAllCategoriesService = async (
  search?: string,
  page: number = 1,
  limit: number = 5,
) => {
  const offset = (page - 1) * limit;
  const where = search
    ? {
        name: {
          [Op.like]: `%${search}%`,
        },
      }
    : {};

  const { rows, count } = await Category.findAndCountAll({
    //  attributes: ["id", "name"],
    include: [
      {
        model: Event,
        attributes: ["id"],
      },
    ],
    where,
    limit,
    offset,
    distinct: true,
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

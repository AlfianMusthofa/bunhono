import { Op } from "sequelize";
import { Article } from "../models/article.model";
import { Tags } from "../models/tags.model";
import { Category } from "../models/category.model";
import { saveImage } from "../utils/upload";
import { BadRequestError } from "../errors/BadRequestError";
import { NotFoundError } from "../errors/NotFoundError";
import { generateSlug } from "../utils/slug";

export const getAllArticlesService = async ({
  limit = 10,
  page = 1,
  search,
  category,
}: {
  limit?: number;
  page?: number;
  search?: string;
  category?: string;
}) => {
  const offset = (page - 1) * limit;
  const where: any = {};

  if (search) {
    where.title = {
      [Op.like]: `%${search}%`,
    };
  }

  if (category) {
    const categoryId = Number(category);
    if (!isNaN(categoryId)) {
      where.categoryId = categoryId;
    }
  }

  const { rows, count } = await Article.findAndCountAll({
    where,
    limit,
    offset,
    distinct: true,
    order: [["createdAt", "DESC"]],
    include: [
      {
        model: Category,
        as: "category",
        attributes: ["id", "name"],
      },
    ],
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

export const CreateArticleService = async (
  title: string,
  content: string,
  categoryId: number,
  image: File,
) => {
  if (!title) {
    throw new BadRequestError("Title is required!");
  }

  if (!content) {
    throw new BadRequestError("Content is required!");
  }

  if (!categoryId && isNaN(categoryId)) {
    throw new BadRequestError("CategoryId is required!");
  }

  let imagePath: string;

  if (image && image.size > 0) {
    const uploaded = await saveImage(image);
    imagePath = uploaded.secure_url;
  } else {
    throw new BadRequestError("Image is required!");
  }

  const slug = generateSlug(title);

  const res = await Article.create({
    title,
    image: imagePath,
    content,
    categoryId,
    slug,
  });

  return res;
};

export const UpdateArticleService = async (
  slug: string,
  title?: string,
  content?: string,
  categoryId?: number,
  image?: File,
) => {
  const article = await Article.findOne({
    where: {
      slug,
    },
  });

  if (!article) {
    throw new NotFoundError("Article not found!");
  }

  if (title) article.title = title;
  if (content) article.content = content;
  if (categoryId !== undefined && !isNaN(categoryId)) {
    article.categoryId = categoryId;
  }

  if (image && image.size > 0) {
    const uploaded = await saveImage(image);
    article.image = uploaded.secure_url;
  }

  await article.save();
};

export const GetSingleArticle = async (slug: string) => {
  const res = await Article.findOne({
    where: {
      slug,
    },
    include: [
      {
        model: Category,
        as: "category",
        attributes: ["name"],
      },
    ],
  });

  return res;
};

export const DeleteArticleService = async (slug: string) => {
  const res = await Article.findOne({
    where: { slug },
  });

  if (!res) {
    throw new NotFoundError("Article not found!");
  }

  await res.destroy();

  return true;
};

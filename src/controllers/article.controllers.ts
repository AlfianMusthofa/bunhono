import type { Context } from "hono";
import {
  CreateArticleService,
  DeleteArticleService,
  getAllArticlesService,
  UpdateArticleService,
} from "../service/article-service";
import { Article } from "../models/article.model";
import { Category } from "../models/category.model";
import { NotFoundError } from "../errors/NotFoundError";
import { Like } from "../models/like.model";

export const getAllArticles = async (c: Context) => {
  const limit = Number(c.req.query("limit")) || 10;
  const page = Number(c.req.query("page")) || 1;
  const search = c.req.query("search");
  const category = c.req.query("category");

  try {
    const res = await getAllArticlesService({
      limit,
      page,
      search,
      category,
    });

    return c.json(res);
  } catch (error) {
    console.log(error);
  }
};

export const createArticle = async (c: Context) => {
  const formData = await c.req.formData();
  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  const categoryId = Number(formData.get("categoryId"));
  const image = formData.get("image") as File;

  try {
    const res = await CreateArticleService(title, content, categoryId, image);
    return c.json(res);
  } catch (error) {
    console.log(error);
  }
};

export const updateArticle = async (c: Context) => {
  const formData = await c.req.formData();
  const slug = c.req.param("slug");
  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  const categoryId = Number(formData.get("categoryId"));
  const image = formData.get("image") as File;

  try {
    const res = await UpdateArticleService(
      slug,
      title,
      content,
      categoryId,
      image,
    );

    return c.json(res);
  } catch (error) {
    console.log(error);
  }
};

export const deleteArticle = async (c: Context) => {
  const slug = c.req.param("slug");
  try {
    const res = await DeleteArticleService(slug);
    return c.json({ message: "Article deleted successfully" });
  } catch (error) {
    console.log(error);
  }
};

export const getArticleBySlug = async (c: Context) => {
  const slug = c.req.param("slug");
  const user = c.get("user") as { id: number } | undefined;

  const article = await Article.findOne({
    where: { slug },
    include: [
      {
        model: Category,
        as: "category",
        attributes: ["id", "name"],
      },
    ],
  });

  if (!article) {
    throw new NotFoundError("Article not found");
  }

  let liked = false;

  if (user) {
    const existingLike = await Like.findOne({
      where: {
        userId: user.id,
        articleId: article.id,
      },
    });

    liked = !!existingLike;
  }

  return c.json({
    article,
    liked,
  });
};

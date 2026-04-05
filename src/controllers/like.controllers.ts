import type { Context } from "hono";
import { Like } from "../models/like.model";
import { BadRequestError } from "../errors/BadRequestError";
import { Article } from "../models/article.model";
import { NotFoundError } from "../errors/NotFoundError";

export const toggleLikeArticle = async (c: Context) => {
  const authUser = c.get("user") as { id: number };
  const userId = authUser.id;
  const articleId = Number(c.req.param("articleId"));

  if (!articleId || isNaN(articleId)) {
    throw new BadRequestError("Article Id not valid!");
  }

  const article = await Article.findByPk(articleId);
  if (!article) {
    throw new NotFoundError("Article not found!");
  }

  const existingLike = await Like.findOne({
    where: { userId, articleId },
  });

  if (existingLike) {
    await existingLike.destroy();

    return c.json({
      message: "Article unliked!",
      liked: false,
    });
  }

  await Like.create({
    userId,
    articleId,
  });

  return c.json(
    {
      message: "Article liked!",
      liked: true,
    },
    201,
  );
};

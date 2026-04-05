import type { Context } from "hono";
import { Comment } from "../models/comment.model";
import { User } from "../models/user.model";
import { Article } from "../models/article.model";
import { NotFoundError } from "../errors/NotFoundError";

export const createComment = async (c: Context) => {
  const authUser = c.get("user") as { id: number };
  const articleId = Number(c.req.param("articleId"));
  const { content } = await c.req.json();
  const userId = authUser.id;

  try {
    if (!content || content.trim() === "") {
      return c.json({ message: "Content is required" }, 400);
    }

    const article = await Article.findByPk(articleId);

    if (!article) {
      throw new NotFoundError("Article not found!");
    }

    await Comment.create({
      userId,
      articleId,
      content,
    });

    return c.json({ message: "Success" }, 201);
  } catch (error: any) {
    console.log("error: ", error.message);
  }
};

export const getCommentArticlById = async (c: Context) => {
  const articleId = c.req.param("articleId");
  try {
    const comments = await Comment.findAll({
      where: {
        articleId,
      },
      include: [
        {
          model: User,
          attributes: ["name", "image"],
        },
      ],
    });

    if (!comments) {
      return c.json({ messsage: "Comments not found!" }, 404);
    }

    return c.json(comments);
  } catch (error) {
    console.log(error);
  }
};

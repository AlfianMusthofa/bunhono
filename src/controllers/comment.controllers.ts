import type { Context } from "hono";
import { Comment } from "../models/comment.model";
import { User } from "../models/user.model";
import { Article } from "../models/article.model";
import { NotFoundError } from "../errors/NotFoundError";

export const createComment = async (c: Context) => {
  const authUser = c.get("user") as { id: number };
  const articleId = Number(c.req.param("articleId"));
  const { content, parentId } = await c.req.json();
  const userId = authUser.id;

  try {
    if (!content || content.trim() === "") {
      return c.json({ message: "Content is required" }, 400);
    }

    const article = await Article.findByPk(articleId);

    if (!article) {
      throw new NotFoundError("Article not found!");
    }

    if (parentId) {
      const parentComment = await Comment.findByPk(parentId);
      if (!parentComment) {
        return c.json({ message: "Parent comment not found!" });
      }
    }

    await Comment.create({
      userId,
      articleId,
      content,
      parentId: parentId || null,
    });

    return c.json({ message: "Success" }, 201);
  } catch (error: any) {
    console.log("error: ", error.message);
  }
};

export const getCommentArticlById = async (c: Context) => {
  const articleId = c.req.param("articleId");
  const limit = Number(c.req.query("limit")) || 10;
  const page = Number(c.req.query("page")) || 1;
  const offset = (page - 1) * limit;

  try {
    const { rows, count } = await Comment.findAndCountAll({
      where: {
        articleId,
      },
      include: [
        {
          model: User,
          attributes: ["name", "image"],
        },
      ],
      limit,
      offset,
      order: [["createdAt", "DESC"]],
    });

    return c.json({
      data: rows,
      meta: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    console.log(error);
  }
};

export const getAllComments = async (c: Context) => {
  const limit = Number(c.req.query("limit")) || 10;
  const page = Number(c.req.query("page")) || 1;
  const offset = (page - 1) * limit;

  const { rows, count } = await Comment.findAndCountAll({
    include: [
      {
        model: User,
        attributes: ["name"],
      },
      {
        model: Article,
        attributes: ["title"],
      },
    ],
    limit,
    offset,
    order: [["createdAt", "DESC"]],
  });

  return c.json({
    data: rows,
    meta: {
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit),
    },
  });
};

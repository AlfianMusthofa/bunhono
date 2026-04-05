import { Hono } from "hono";
import {
  createComment,
  getCommentArticlById,
} from "../controllers/comment.controllers";
import { authMiddleware } from "../middleware/auth.middleware";

const route = new Hono();

route.get("/:articleId", getCommentArticlById);
route.post("/:articleId", authMiddleware, createComment);

export default route;

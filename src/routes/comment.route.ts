import { Hono } from "hono";
import {
  createComment,
  getAllComments,
  getCommentArticlById,
} from "../controllers/comment.controllers";
import { authMiddleware } from "../middleware/auth.middleware";

const route = new Hono();

route.get("/", getAllComments);
route.get("/:articleId", getCommentArticlById);
route.post("/:articleId", authMiddleware, createComment);

export default route;

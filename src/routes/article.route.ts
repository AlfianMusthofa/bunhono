import { Hono } from "hono";
import {
  createArticle,
  deleteArticle,
  getAllArticles,
  getArticleBySlug,
  updateArticle,
} from "../controllers/article.controllers";
import { authMiddleware, optionalAuth } from "../middleware/auth.middleware";
import { toggleLikeArticle } from "../controllers/like.controllers";

const route = new Hono();

route.get("/", getAllArticles);
route.get("/:slug", optionalAuth, getArticleBySlug);
route.post("/", createArticle);
route.patch("/:slug", updateArticle);
route.delete("/:slug", deleteArticle);

// LIKE
route.post("/:articleId/like", authMiddleware, toggleLikeArticle);
export default route;

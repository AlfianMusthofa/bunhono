import { Hono } from "hono";
import {
  createArticle,
  deleteArticle,
  getAllArticles,
  updateArticle,
} from "../controllers/article.controllers";

const route = new Hono();

route.get("/", getAllArticles);
route.post("/", createArticle);
route.patch("/:slug", updateArticle);
route.delete("/:slug", deleteArticle);

export default route;

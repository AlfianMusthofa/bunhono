import type { Context } from "hono";
import { Category } from "../models/category.model";

export const addCategory = async (c: Context) => {
  const body = await c.req.json();
  const category = await Category.create({
    name: body.name,
  });
  return c.json({
    message: "Category added!",
    category: {
      id: category.id,
      name: category.name,
    },
  });
};

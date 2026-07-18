import type { Context } from "hono";
import { Category } from "../models/category.model";
import { Event } from "../models/event.model";
import { GetAllCategoriesService } from "../service/category-service";
import { EventStatus } from "../models/eventStatus.model";

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

export const getCategories = async (c: Context) => {
  const search = c.req.param("search");
  const page = Number(c.req.query("page")) || 1;
  const limit = Number(c.req.query("limit")) || 4;
  const category = await GetAllCategoriesService(search, page, limit);
  return c.json(category);
};

export const getCategoryWithEvents = async (c: Context) => {
  const category = await Category.findAll({
    attributes: ["id", "name"],
    include: [
      {
        model: Event,
        attributes: ["id", "slug", "title", "image", "description", "startAt"],
        include: [
          {
            model: EventStatus,
            as: "status",
            attributes: [],
            where: {
              code: "active",
            },
            required: true,
          },
        ],
        required: false,
      },
    ],
  });

  return c.json(category);
};

export const getCategoryEvents = async (c: Context) => {
  const categoryId = Number(c.req.param("id"));

  if (isNaN(categoryId)) {
    return c.json({ message: "Invalid category id" }, 400);
  }

  const category = await Category.findByPk(categoryId, {
    include: [
      {
        model: Event,
        attributes: ["id", "title", "image", "description"],
      },
    ],
  });

  if (!category) {
    return c.json({ message: "Category not found" }, 404);
  }

  return c.json(category);
};

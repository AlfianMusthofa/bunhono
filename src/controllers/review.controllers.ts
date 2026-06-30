import type { Context } from "hono";
import {
  getMyReviewService,
  getReviewsByEventService,
  getReviewsService,
  postReviewService,
} from "../service/review-service";
import { Review } from "../models/review.model";

export const getReviews = async (c: Context) => {
  const limit = Number(c.req.query("limit")) || 10;
  const page = Number(c.req.query("page")) || 1;

  try {
    const reviews = await getReviewsService(page, limit);
    return c.json(reviews);
  } catch (error) {
    console.error(error);
  }
};

export const getReviewsByEvent = async (c: Context) => {
  const limit = Number(c.req.query("limit")) || 10;
  const page = Number(c.req.query("page")) || 1;
  const eventId = Number(c.req.param("eventId"));

  try {
    const reviews = await getReviewsByEventService(page, limit, eventId);
    return c.json(reviews);
  } catch (error) {
    console.error(error);
  }
};

export const postReview = async (c: Context) => {
  const formData = await c.req.formData();
  const authUser = c.get("user") as { id: number };
  const userId = authUser.id;
  const eventId = Number(c.req.param("eventId"));
  const content = formData.get("content") as string;
  const rating = Number(formData.get("rating"));
  const image = (formData.get("image") as File | null) ?? undefined;

  try {
    if (!eventId || isNaN(eventId)) {
      return c.json({ message: "Invalid eventId" }, 401);
    }

    if (!rating || rating < 1 || rating > 5) {
      return c.json({ message: "Rating must be between 1 and 5" }, 400);
    }

    const review = await postReviewService(
      userId,
      eventId,
      rating,
      content,
      image,
    );
    return c.json(review);
  } catch (error) {
    console.error(error);
    return c.json("Internal server error", 500);
  }
};

export const getMyReview = async (c: Context) => {
  const authUser = c.get("user") as { id: number };
  const userId = authUser.id;
  const eventId = Number(c.req.param("eventId"));

  try {
    const review = await getMyReviewService(userId, eventId);
    return c.json({
      myReview: review,
    });
  } catch (error) {
    console.error(error);
    return c.json({ message: "Internal Server Error" }, 500);
  }
};

export const totalReview = async (c: Context) => {
  const authUser = c.get("user") as { id: number };
  try {
    const total = await Review.count({
      where: {
        userId: authUser.id,
      },
    });
    return c.json(total);
  } catch (error) {
    console.error(error);
    return c.json({ message: "Internal Server Error" }, 500);
  }
};

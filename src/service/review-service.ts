import { Review } from "../models/review.model";
import { User } from "../models/user.model";
import { Event } from "../models/event.model";
import { NotFoundError } from "../errors/NotFoundError";
import { saveImage } from "../utils/upload";

export const getReviewsService = async (
  page: number = 1,
  limit: number = 10,
) => {
  const offset = (page - 1) * limit;
  const { rows, count } = await Review.findAndCountAll({
    include: [
      {
        model: User,
        as: "user",
        attributes: ["name", "image"],
      },
      {
        model: Event,
        as: "event",
        attributes: ["title"],
      },
    ],
    limit,
    offset,
    order: [["createdAt", "DESC"]],
  });

  return {
    data: rows,
    meta: {
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit),
    },
  };
};

export const getReviewsByEventService = async (
  page: number = 1,
  limit: number = 10,
  eventId: number,
) => {
  const offset = (page - 1) * limit;
  const { rows, count } = await Review.findAndCountAll({
    attributes: ["rating", "content", "image"],
    where: {
      eventId,
    },
    include: [
      {
        model: User,
        as: "user",
        attributes: ["id", "name"],
      },
      {
        model: Event,
        as: "event",
        attributes: ["id", "title"],
      },
    ],
    limit,
    offset,
    order: [["createdAt", "DESC"]],
  });

  return {
    data: rows,
    meta: {
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit),
    },
  };
};

export const postReviewService = async (
  userId: number,
  eventId: number,
  rating: number,
  content?: string | null,
  image?: File,
) => {
  const event = await Event.findByPk(eventId);
  if (!event) {
    throw new NotFoundError("Event not found!");
  }

  const checkReview = await Review.findOne({
    where: { userId, eventId },
  });
  if (checkReview) {
    let imagePath = checkReview.image;

    if (image && image.size > 0) {
      const uploaded = await saveImage(image);
      imagePath = uploaded.secure_url;
    }

    return await checkReview.update({ rating, content });
  }

  if (rating < 1 || rating > 5) {
    throw new Error("Rating must be between 1 and 5");
  }

  let imagePath: string | null = null;

  if (image && image.size > 0) {
    const uploaded = await saveImage(image);
    imagePath = uploaded.secure_url;
  }

  const review = await Review.create({
    userId,
    eventId,
    rating,
    content,
    image: imagePath,
  });

  return review;
};

export const getMyReviewService = async (userId: number, eventId: number) => {
  const review = await Review.findOne({
    where: {
      userId,
      eventId,
    },
  });

  return review;
};

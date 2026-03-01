import type { Context } from "hono";
import { EventStatus } from "../models/eventStatus.model";

export const getStatus = async (c: Context) => {
  const res = await EventStatus.findAll();
  return c.json(res, 200);
};

import type { Context } from "hono";
import { EventStatus } from "../models/eventStatus.model";
import { countEventByStatus } from "../service/status-service";

export const getStatus = async (c: Context) => {
  const res = await EventStatus.findAll();
  return c.json(res, 200);
};

export const activeStatus = async (c: Context) => {
  const total = await countEventByStatus("active");
  return c.json({
    status: "active",
    total,
  });
};

export const pendingStatus = async (c: Context) => {
  const total = await countEventByStatus("pending");
  return c.json({
    status: "pending",
    total,
  });
};

export const endedStatus = async (c: Context) => {
  const total = await countEventByStatus("ended");
  return c.json({
    status: "ended",
    total,
  });
};

export const cancelledStatus = async (c: Context) => {
  const total = await countEventByStatus("cancelled");
  return c.json({
    status: "cancelled",
    total,
  });
};

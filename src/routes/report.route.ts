import { Hono } from "hono";
import { downloadParticipantsReport } from "../controllers/report.controllers";

const route = new Hono();

route.get("/:id/participants/report", downloadParticipantsReport);

export default route;

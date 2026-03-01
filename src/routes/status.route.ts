import { Hono } from "hono";
import { getStatus } from "../controllers/eventStatus";

const statusRoute = new Hono();

statusRoute.get("/", getStatus);

export default statusRoute;

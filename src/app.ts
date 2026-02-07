import { Hono } from "hono";
import userRoute from "./routes/user.route";
import authRoute from "./routes/auth.route";
import eventRoute from "./routes/event.route";
import categoryRoute from "./routes/category.route";
import mentorRoute from "./routes/mentor.route";
import { serveStatic } from "hono/bun";
import { cors } from "hono/cors";

const app = new Hono();

app.use("/uploads/*", serveStatic({ root: "./" }));
app.use(cors());
app.get("/", (c) => c.text("API Bun Hono"));

app.route("/users", userRoute);
app.route("/auth", authRoute);
app.route("/events", eventRoute);
app.route("/category", categoryRoute);
app.route("/mentors", mentorRoute);

export default app;

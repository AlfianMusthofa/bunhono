import { Hono } from "hono";
import userRoute from "./routes/user.route";
import authRoute from "./routes/auth.route";
import eventRoute from "./routes/event.route";
import categoryRoute from "./routes/category.route";
import mentorRoute from "./routes/mentor.route";
import { serveStatic } from "hono/bun";
import { cors } from "hono/cors";
import statusRoute from "./routes/status.route";
import certif from "./routes/certificate.route";
import report from "./routes/report.route";
import "./jobs/eventStatus.job";
import articles from "./routes/article.route";
import comments from "./routes/comment.route";
import reviews from "./routes/review.route";
import chat from "./routes/aichat.route";
import emailRoute from "./routes/email.route";

const app = new Hono();

app.use("/uploads/*", serveStatic({ root: "./" }));
app.use(cors());
app.get("/", (c) => c.text("API Bun Hono"));

app.route("/users", userRoute);
app.route("/auth", authRoute);
app.route("/events", eventRoute);
app.route("/category", categoryRoute);
app.route("/mentors", mentorRoute);
app.route("/status", statusRoute);
app.route("/certificate", certif);
app.route("/report", report);
app.route("/articles", articles);
app.route("/comments", comments);
app.route("/reviews", reviews);
app.route("/ai", chat);
app.route("/email", emailRoute);

export default app;

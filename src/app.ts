import { Hono } from "hono";
import userRoute from "./routes/user.route";
import authRoute from "./routes/auth.route";

const app = new Hono();

app.get("/", (c) => c.text("API Bun Hono"));
app.route("/users", userRoute);
app.route("/auth", authRoute);

export default app;

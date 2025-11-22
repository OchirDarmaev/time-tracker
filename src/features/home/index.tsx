import { Hono } from "hono";
import { HomePage } from "./components/home_page";

const app = new Hono().get("/", (c) => c.render(<HomePage />));

export default app;

import { Hono } from "hono";
import HomePage from "./components/HomePage";

const app = new Hono().get("/", (c) => c.render(<HomePage />));

export default app;

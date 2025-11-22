import { Context, Next } from "hono";
import { getCookie } from "hono/cookie";

export const requireAuth = async (c: Context, next: Next) => {
  const userId = getCookie(c, "user_id");

  if (!userId) {
    return c.redirect("/auth/login", 302);
  }

  await next();
};

import { drizzle } from "drizzle-orm/d1";
import type { Context } from "hono";
import { ContextType } from "..";

export const db = (c: Context<ContextType>) => {
  return drizzle(c.env.D1);
};

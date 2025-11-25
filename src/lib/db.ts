import { drizzle } from "drizzle-orm/d1";
import type { Context } from "hono";
import type{ Resource } from "sst";

export const db = (c: Context<{ Bindings: typeof Resource }>) => {
  return drizzle(c.env.D1);
};

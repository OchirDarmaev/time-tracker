import { drizzle } from "drizzle-orm/d1";
import { Resource } from "sst";
export const db = drizzle(Resource.D1);

import express from "express";
import session from "express-session";
import cookieParser from "cookie-parser";
import { initializeDatabase } from "./config/database.js";
import { authStubMiddleware } from "./middleware/auth_stub.js";
import { router } from "./router.js";
import { apiContract } from "./contracts/api.js";
import { createExpressEndpoints } from "@ts-rest/express";
import type { Request, RequestHandler, Response } from "express";

const app = express();
const PORT = process.env.PORT || 3002;

try {
  initializeDatabase();
  console.log("Database initialized successfully");
} catch (error) {
  console.error("Error initializing database:", error);
}

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
// @ts-expect-error - Express session middleware type issue
app.use(
  session({
    secret: "timetrack-secret-key-change-in-production",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);

app.use(authStubMiddleware);

createExpressEndpoints(apiContract, router, app, {
  responseValidation: false,
  jsonQuery: true,
  onError: (err: any, req: Request, res: Response) => {
    console.error("ts-rest error:", err);
    if (!res.headersSent) {
      res.status(500).json({ error: "Internal server error" });
    }
  },
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

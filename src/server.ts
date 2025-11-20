import express from "express";
import session from "express-session";
import cookieParser from "cookie-parser";
import { initializeDatabase } from "@/shared/config/database.js";
import { SqliteSessionStore } from "@/shared/config/session_store.js";
import { createExpressEndpoints } from "@ts-rest/express";
import { authContract } from "@/features/auth/contract.js";
import { authRouter } from "@/features/auth/router.js";
import { rootContract } from "@/features/root/contract.js";
import { rootRouter } from "@/features/root/router.js";
import { accountDashboardContract } from "@/features/account/dashboard/contract.js";
import { accountTimeRouter } from "@/features/account/dashboard/router.js";
import { adminProjectsContract } from "@/features/admin/projects/contract.js";
import { adminProjectsRouter } from "@/features/admin/projects/router.js";
import { authStubMiddleware } from "@/shared/middleware/auth_stub.js";

const app = express();
const PORT = process.env.PORT || 3000;

try {
  initializeDatabase();
  console.log("Database initialized successfully");
} catch (error) {
  console.error("Error initializing database:", error);
}

const sessionStore = new SqliteSessionStore();

app.use(
  express.urlencoded({ extended: true }),
  express.json(),
  cookieParser(),
  session({
    secret: "timetrack-secret-key-change-in-production",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 }, // 24 hours
    store: sessionStore,
  })
);

// Serve static CSS and JS files from dist
app.use("/static/styles", express.static("dist/static/styles"));
app.use("/static/js", express.static("dist/static/js"));

createExpressEndpoints(authContract, authRouter, app, {
  responseValidation: false,
  jsonQuery: true,
});

createExpressEndpoints(rootContract, rootRouter, app, {
  responseValidation: false,
  jsonQuery: true,
  globalMiddleware: [authStubMiddleware<typeof rootContract>],
});

createExpressEndpoints(accountDashboardContract, accountTimeRouter, app, {
  responseValidation: false,
  jsonQuery: true,
  globalMiddleware: [authStubMiddleware<typeof accountDashboardContract>],
});

createExpressEndpoints(adminProjectsContract, adminProjectsRouter, app, {
  responseValidation: false,
  jsonQuery: true,
  globalMiddleware: [authStubMiddleware<typeof adminProjectsContract>],
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

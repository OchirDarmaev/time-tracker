import express from "express";
import session from "express-session";
import cookieParser from "cookie-parser";
import { initializeDatabase } from "@/shared/config/database.js";
// import { authStubMiddleware } from "@/shared/middleware/auth_stub.js";
import { createExpressEndpoints } from "@ts-rest/express";
import { authContract } from "@/features/auth/contract.js";
import { authRouter } from "@/features/auth/router.js";
import { rootContract } from "@/features/root/contract.js";
import { rootRouter } from "@/features/root/router.js";
import { accountDashboardContract } from "@/features/account/dashboard/contract.js";
import { accountTimeRouter } from "@/features/account/dashboard/router.js";
import { authStubMiddleware } from "@/shared/middleware/auth_stub.js";

const app = express();
const PORT = process.env.PORT || 3000;

try {
  initializeDatabase();
  console.log("Database initialized successfully");
} catch (error) {
  console.error("Error initializing database:", error);
}

app.use(
  express.urlencoded({ extended: true }),
  express.json(),
  cookieParser(),
  session({
    secret: "timetrack-secret-key-change-in-production",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);

// Serve static CSS files
app.use("/public/styles", express.static("public/styles"));

createExpressEndpoints(authContract, authRouter, app, {
  responseValidation: false,
  jsonQuery: true,
});

createExpressEndpoints(rootContract, rootRouter, app, {
  responseValidation: false,
  jsonQuery: true,
  globalMiddleware: [authStubMiddleware],
});

createExpressEndpoints(accountDashboardContract, accountTimeRouter, app, {
  responseValidation: false,
  jsonQuery: true,
  globalMiddleware: [authStubMiddleware],
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

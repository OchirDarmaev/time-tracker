import express from "express";
import session from "express-session";
import cookieParser from "cookie-parser";
import { initializeDatabase } from "./shared/config/database.js";
import { authStubMiddleware } from "./shared/middleware/auth_stub.js";
import { createExpressEndpoints } from "@ts-rest/express";
import { authContract } from "./features/auth/contract.js";
import { authRouter } from "./features/auth/router.js";
import { rootContract } from "./features/root/contract.js";
import { rootRouter } from "./features/root/router.js";
import { workerTimeContract } from "./features/worker/time/contract.js";
import { workerTimeRouter } from "./features/worker/time/router.js";
import { managerReportsContract } from "./features/manager/reports/contract.js";
import { managerReportsRouter } from "./features/manager/reports/router.js";
import { adminProjectsContract } from "./features/admin/projects/contract.js";
import { adminProjectsRouter } from "./features/admin/projects/router.js";
import { adminUsersProjectsContract } from "./features/admin/users_projects/contract.js";
import { adminUsersProjectsRouter } from "./features/admin/users_projects/router.js";
import { adminSystemReportsContract } from "./features/admin/system_reports/contract.js";
import { adminSystemReportsRouter } from "./features/admin/system_reports/router.js";

const app = express();
const PORT = process.env.PORT || 3000;

try {
  initializeDatabase();
  console.log("Database initialized successfully");
} catch (error) {
  console.error("Error initializing database:", error);
}

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(
  session({
    secret: "timetrack-secret-key-change-in-production",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);

app.use(authStubMiddleware);

createExpressEndpoints(authContract, authRouter, app, {
  responseValidation: false,
  jsonQuery: true,
});

createExpressEndpoints(rootContract, rootRouter, app, {
  responseValidation: false,
  jsonQuery: true,
});

createExpressEndpoints(workerTimeContract, workerTimeRouter, app, {
  responseValidation: false,
  jsonQuery: true,
});

createExpressEndpoints(managerReportsContract, managerReportsRouter, app, {
  responseValidation: false,
  jsonQuery: true,
});

createExpressEndpoints(adminProjectsContract, adminProjectsRouter, app, {
  responseValidation: false,
  jsonQuery: true,
});

createExpressEndpoints(adminUsersProjectsContract, adminUsersProjectsRouter, app, {
  responseValidation: false,
  jsonQuery: true,
});

createExpressEndpoints(adminSystemReportsContract, adminSystemReportsRouter, app, {
  responseValidation: false,
  jsonQuery: true,
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

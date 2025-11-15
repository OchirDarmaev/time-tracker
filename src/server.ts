import express from "express";
import session from "express-session";
import cookieParser from "cookie-parser";
import { initializeDatabase } from "./config/database.js";
import { authStubMiddleware } from "./middleware/auth_stub.js";
import { createExpressEndpoints } from "@ts-rest/express";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { authStubContract } from "./contracts/auth_stub_contract.js";
import { authStubRouter } from "./routes/auth_stub_router.js";
import { rootContract } from "./contracts/root_contract.js";
import { rootRouter } from "./routes/root_router.js";
import { workerContract } from "./contracts/worker_contract.js";
import { workerRouter } from "./routes/worker_router.js";
import { managerContract } from "./contracts/manager_contract.js";
import { managerRouter } from "./routes/manager_router.js";
import { adminProjectsContract } from "./contracts/admin_projects_contract.js";
import { adminProjectsRouter } from "./routes/admin_projects_router.js";
import { adminUsersProjectsContract } from "./contracts/admin_users_projects_contract.js";
import { adminUsersProjectsRouter } from "./routes/admin_users_projects_router.js";
import { adminSystemReportsContract } from "./contracts/admin_system_reports_contract.js";
import { adminSystemReportsRouter } from "./routes/admin_system_reports_router.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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
app.use(
  session({
    secret: "timetrack-secret-key-change-in-production",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);

app.use(authStubMiddleware);

// Serve static component files
// TypeScript components are compiled to dist/views/components/*.js
// Always serve from dist/views/components (components must be compiled first)
const componentsPath = join(process.cwd(), "dist/views/components");
app.use("/components", express.static(componentsPath, { extensions: ["js"] }));
console.log(`Serving components from: ${componentsPath}`);

createExpressEndpoints(authStubContract, authStubRouter, app, {
  responseValidation: false,
  jsonQuery: true,
});

createExpressEndpoints(rootContract, rootRouter, app, {
  responseValidation: false,
  jsonQuery: true,
});

createExpressEndpoints(workerContract, workerRouter, app, {
  responseValidation: false,
  jsonQuery: true,
});

createExpressEndpoints(managerContract, managerRouter, app, {
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

import express from "express";
import session from "express-session";
import cookieParser from "cookie-parser";
import { initializeDatabase } from "./config/database.js";
import { authStubMiddleware } from "./middleware/auth_stub.js";
import { router } from "./router.js";
import { apiContract } from "./contracts/api.js";
import { createExpressEndpoints } from "@ts-rest/express";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

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

createExpressEndpoints(apiContract, router, app, {
  responseValidation: false,
  jsonQuery: true,
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

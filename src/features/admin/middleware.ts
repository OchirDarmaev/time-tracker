// Admin middleware now just uses requireAuth from auth/middleware
// All authenticated users have access to admin features
export { requireAuth as requireAdmin } from "../auth/middleware";
export { requireAuth as requireOfficeManagerOrAdmin } from "../auth/middleware";

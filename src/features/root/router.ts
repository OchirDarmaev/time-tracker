import { initServer } from "@ts-rest/express";
import { rootContract } from "./contract.js";
import { renderRoot } from "./views/render-root.js";

const s = initServer();

export const rootRouter = s.router(rootContract, {
  root: async () => {
    const html = renderRoot();
    return {
      status: 200,
      body: String(html),
    };
  },
  toggleTheme: async ({ req, res }) => {
    const currentTheme = req.cookies?.theme || "dark";
    const newTheme = currentTheme === "dark" ? "light" : "dark";

    res.cookie("theme", newTheme, {
      maxAge: 365 * 24 * 60 * 60 * 1000,
      httpOnly: false,
    });

    res.setHeader("HX-Refresh", "true");
    return {
      status: 204,
      body: undefined,
    };
  },
});

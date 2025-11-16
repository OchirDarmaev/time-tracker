import { initServer } from "@ts-rest/express";
import { rootContract } from "./contract.js";
import { renderRoot } from "./views/render-root.js";

const s = initServer();

export const rootRouter = s.router(rootContract, {
  root: async () => {
    const html = renderRoot();
    return {
      status: 200,
      body: html,
    };
  },
});

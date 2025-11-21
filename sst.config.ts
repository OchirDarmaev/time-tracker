/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "time-tracker",
      removal: input?.stage === "production" ? "retain" : "remove",
      protect: ["production"].includes(input?.stage),
      home: "cloudflare",
    };
  },
  async run() {
    const d1 = new sst.cloudflare.D1("D1");
    const worker = new sst.cloudflare.Worker("Hono", {
      handler: "dist/time_tracker/index.js",
      assets: {
        directory: "./dist/client",
      },
      url: true,
      link: [d1],
    });
    return {
      api: worker.url,
    };
  },
});

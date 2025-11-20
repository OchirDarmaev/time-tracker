// eslint-disable-next-line @typescript-eslint/triple-slash-reference
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
    const db = new sst.cloudflare.D1("DB");
    const worker = new sst.cloudflare.Worker("time-tracker", {
      handler: "src/cloudflare-worker.ts",
      url: true,
      link: [db],
      // build: {
      //   minify: true,
      // },
      assets: {
        directory: "./dist",
      },
    });
    return {
      workerUrl: worker.url,
    };
  },
});

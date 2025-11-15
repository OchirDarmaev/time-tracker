import { initContract } from "@ts-rest/core";

const c = initContract();

export const htmlResponse = c.otherResponse({
  contentType: "text/html",
  body: c.type<string>(),
});

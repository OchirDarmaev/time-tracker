import { c } from "./admin_users_projects_contract";

export const htmlResponse = c.otherResponse({
  contentType: "text/html",
  body: c.type<string>(),
});

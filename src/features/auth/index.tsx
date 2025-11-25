import { Hono } from "hono";
import AuthPage from "./components/AuthPage";
import * as v from "valibot";
import { sValidator } from "@hono/standard-validator";
import { setCookie, deleteCookie } from "hono/cookie";
import {
  getCurrentUser,
  getRoleLabel,
  roleOptions,
  userOptions,
} from "./service";

const app = new Hono()
  .get("/", async (c) => {
    const currentUser = await getCurrentUser();
    const currentUserRoleLabel = getRoleLabel(currentUser.role);

    return c.render(
      <AuthPage
        currentUser={currentUser}
        userOptions={userOptions}
        roleOptions={roleOptions}
        currentUserRoleLabel={currentUserRoleLabel}
      />
    );
  })
  .post(
    "/stubLogin",
    sValidator(
      "form",
      v.object({
        userId: v.string(),
        role: v.string(),
        redirectUrl: v.string(),
      })
    ),
    (c) => {
      const data = c.req.valid("form");
      setCookie(c, "user_id", data.userId);

      return c.redirect(data.redirectUrl, 302);
    }
  )
  .post("/logout", (c) => {
    deleteCookie(c, "user_id");
    return c.redirect("/auth", 302);
  });

export default app;

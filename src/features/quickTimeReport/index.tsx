import { Hono } from "hono";
import { getCookie } from "hono/cookie";
import * as v from "valibot";
import { sValidator } from "@hono/standard-validator";
import QuickTimeReportView from "./components/QuickTimeReportView";
import { EntriesTable } from "./components/EntriesTable";
import { formatDate } from "../../lib/date_utils";
import { projectModel } from "../../lib/models";
import { timeEntryModel } from "../../lib/models";
import { repo } from "../../lib/repo";
import { REQUIRED_DAILY_HOURS } from "./getMonthlySummaryData";
import { requireAuth } from "../auth/middleware";
import { ContextType } from "../..";

// const DateOnlySchema = v.pipe(
//   v.string(),
//   v.regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format')
// )

const app = new Hono<ContextType>()
  .use(requireAuth)
  .get("", sValidator("query", v.object({ date: v.string() })), async (c) => {
    const userId = getCookie(c, "user_id");
    if (!userId) {
      return c.redirect("/auth/login", 302);
    }

    const user = await repo.findUserById(c, Number(userId));
    if (!user) {
      return c.redirect("/auth/login", 302);
    }

    const { date } = c.req.valid("query");
    const currentUser = {
      id: user.id,
      email: user.email,
      role: JSON.parse(user.roles)[0] || "account",
    };

    return c.render(
      <QuickTimeReportView
        c={c}
        currentUser={currentUser}
        selectedDate={date}
      />
    );
  })
  .get("/entries", async (c) => {
    const userId = getCookie(c, "user_id");
    if (!userId) {
      return c.text("Unauthorized", 401);
    }

    const user = await repo.findUserById(c, Number(userId));
    if (!user) {
      return c.text("Unauthorized", 401);
    }

    const date = c.req.query("date") || formatDate(new Date());
    const currentUser = {
      id: user.id,
      email: user.email,
      role: JSON.parse(user.roles)[0] || "account",
    };

    const projects = await projectModel.getByUserId(c, currentUser.id);
    const entries = await timeEntryModel.getByUserIdAndDate(
      c,
      currentUser.id,
      date
    );

    return c.render(<EntriesTable entries={entries} projects={projects} />);
  })
  .post(
    "/entries",
    sValidator(
      "form",
      v.object({
        project_id: v.pipe(v.string(), v.transform(Number)),
        date: v.string(),
        hours: v.optional(v.pipe(v.string(), v.transform(Number))),
        comment: v.optional(v.string()),
      })
    ),
    async (c) => {
      const userId = getCookie(c, "user_id");
      if (!userId) {
        return c.text("Unauthorized", 401);
      }

      const user = await repo.findUserById(c, Number(userId));
      if (!user) {
        return c.text("Unauthorized", 401);
      }

      const data = c.req.valid("form");
      const currentUser = {
        id: user.id,
        email: user.email,
        role: JSON.parse(user.roles)[0] || "account",
      };

      let localHours = 0;
      if (!data.hours) {
        const availableHours = await timeEntryModel.getTotalHoursByUserAndDate(
          c,
          currentUser.id,
          data.date
        );
        localHours = Math.max(1, REQUIRED_DAILY_HOURS - availableHours);
      } else {
        localHours = data.hours;
      }

      const project = await projectModel.getById(c, data.project_id);
      if (!project) {
        return c.text("Invalid project", 400);
      }

      const userProjects = await projectModel.getByUserId(c, currentUser.id);
      if (!userProjects.find((p) => p.id === project.id)) {
        return c.text("Access denied to this project", 403);
      }

      await timeEntryModel.create(
        c,
        currentUser.id,
        project.id,
        data.date,
        localHours,
        data.comment || null
      );

      return c.render(
        <QuickTimeReportView
          c={c}
          currentUser={currentUser}
          selectedDate={data.date}
        />
      );
    }
  )
  .delete("/entries/:entryId", async (c) => {
    const userId = getCookie(c, "user_id");
    if (!userId) {
      return c.text("Unauthorized", 401);
    }

    const user = await repo.findUserById(c, Number(userId));
    if (!user) {
      return c.text("Unauthorized", 401);
    }

    const entryId = Number(c.req.param("entryId"));
    const currentUser = {
      id: user.id,
      email: user.email,
      role: JSON.parse(user.roles)[0] || "account",
    };

    const entry = await timeEntryModel.getById(c, entryId);
    if (!entry) {
      return c.text("Entry not found", 404);
    }

    if (entry.user_id !== currentUser.id) {
      return c.text("Access denied", 403);
    }

    await timeEntryModel.delete(c, entryId);
    const date = entry.date;

    return c.render(
      <QuickTimeReportView
        c={c}
        currentUser={currentUser}
        selectedDate={date}
      />
    );
  })
  .post(
    "/segments",
    sValidator(
      "form",
      v.object({
        date: v.string(),
        project_id: v.pipe(v.string(), v.transform(Number)),
        hours: v.pipe(v.string(), v.transform(Number)),
        comment: v.optional(v.string()),
      })
    ),
    async (c) => {
      const userId = getCookie(c, "user_id");
      if (!userId) {
        return c.text("Unauthorized", 401);
      }

      const user = await repo.findUserById(c, Number(userId));
      if (!user) {
        return c.text("Unauthorized", 401);
      }

      const data = c.req.valid("form");
      const currentUser = {
        id: user.id,
        email: user.email,
        role: JSON.parse(user.roles)[0] || "account",
      };

      let localHours: number;
      if (!data.hours) {
        const availableHours = await timeEntryModel.getTotalHoursByUserAndDate(
          c,
          currentUser.id,
          data.date
        );
        localHours = Math.max(1, REQUIRED_DAILY_HOURS - availableHours);
      } else {
        localHours = data.hours;
      }

      const userProjects = await projectModel.getByUserId(c, currentUser.id);
      const project = userProjects.find((p) => p.id === data.project_id);
      if (!project) {
        return c.text("Access denied to this project", 403);
      }

      await timeEntryModel.create(
        c,
        currentUser.id,
        data.project_id,
        data.date,
        localHours,
        data.comment || null
      );

      return c.render(
        <QuickTimeReportView
          c={c}
          currentUser={currentUser}
          selectedDate={data.date}
        />
      );
    }
  )
  .patch(
    "/segments/:entryId",
    sValidator(
      "form",
      v.object({
        hours: v.optional(v.pipe(v.string(), v.transform(Number))),
        comment: v.optional(v.string()),
      })
    ),
    async (c) => {
      const userId = getCookie(c, "user_id");
      if (!userId) {
        return c.text("Unauthorized", 401);
      }

      const user = await repo.findUserById(c, Number(userId));
      if (!user) {
        return c.text("Unauthorized", 401);
      }

      const entryId = Number(c.req.param("entryId"));
      const data = c.req.valid("form");
      const currentUser = {
        id: user.id,
        email: user.email,
        role: JSON.parse(user.roles)[0] || "account",
      };

      const entry = await timeEntryModel.getById(c, entryId);
      if (!entry) {
        return c.text("Entry not found", 404);
      }

      if (entry.user_id !== currentUser.id) {
        return c.text("Access denied", 403);
      }

      const updates: { hours?: number; comment?: string | null } = {};
      if (data.hours !== undefined) {
        updates.hours = data.hours;
      }
      if (data.comment !== undefined) {
        updates.comment = data.comment || null;
      }

      await timeEntryModel.update(c, entryId, updates);

      return c.render(
        <QuickTimeReportView
          c={c}
          currentUser={currentUser}
          selectedDate={entry.date}
        />
      );
    }
  )
  .delete(
    "/segments/:entryId",
    sValidator(
      "param",
      v.object({ entryId: v.pipe(v.string(), v.transform(Number)) })
    ),
    async (c) => {
      const userId = getCookie(c, "user_id");
      if (!userId) {
        return c.text("Unauthorized", 401);
      }

      const user = await repo.findUserById(c, Number(userId));
      if (!user) {
        return c.text("Unauthorized", 401);
      }

      const entryId = Number(c.req.param("entryId"));
      const currentUser = {
        id: user.id,
        email: user.email,
        role: JSON.parse(user.roles)[0] || "account",
      };

      const entry = await timeEntryModel.getById(c, entryId);
      if (!entry) {
        return c.text("Entry not found", 404);
      }

      if (entry.user_id !== currentUser.id) {
        return c.text("Access denied", 403);
      }

      const date = entry.date;
      await timeEntryModel.delete(c, entryId);

      return c.render(
        <QuickTimeReportView
          c={c}
          currentUser={currentUser}
          selectedDate={date}
        />
      );
    }
  );

export default app;

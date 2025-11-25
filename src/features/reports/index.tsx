import { Hono } from "hono";
import * as v from "valibot";
import { sValidator } from "@hono/standard-validator";
import { requireAuth } from "../auth/middleware";
import { getMonthFromDate, formatDate } from "../../lib/date_utils";
import { ReportView } from "../timeTrackingReport/components/report_view";
import { ContextType } from "../..";

const app = new Hono<ContextType>()
  .use(requireAuth)
  .get(
    "/",
    sValidator("query", v.object({ month: v.optional(v.string()) })),
    async (c) => {
      const month =
        c.req.valid("query").month || getMonthFromDate(formatDate(new Date()));
      return c.render(<ReportView c={c} month={month} />);
    }
  );

export default app;

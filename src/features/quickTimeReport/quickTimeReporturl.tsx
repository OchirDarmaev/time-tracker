import { client } from "../../lib/client";

export function quickTimeReporturl(
  params: {
    query: {
      date: string;
    };
  }
) {
 
  return client.partials.quickTimeReport.$url().pathname+`?date=${params.query.date}`;
}

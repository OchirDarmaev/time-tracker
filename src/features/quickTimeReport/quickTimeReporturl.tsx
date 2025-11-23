import { client } from "../../lib/client";
import { toUrlString } from "../../lib/url";

type QuickTimeReportUrlParams = Parameters<
  typeof client.partials.quickTimeReport.$url
>[0];

export function quickTimeReporturl(params: QuickTimeReportUrlParams) {
  const url = client.partials.quickTimeReport.$url(params);
  return toUrlString(url);
}

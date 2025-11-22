import { client } from "../../lib/client";

export function quickTimeReporturl(
  // TODO: Add type for params
  // params: InferRequestType<typeof client.partials.quickTimeReport.$get>
  params: {
    query: {
      date: string;
    };
  }) {
  const t = client.partials.quickTimeReport.$url();
  Object.entries(params.query || {}).forEach(([key, value]) => {
    t.searchParams.set(key, value as string);
  });
  return t;
}

type UrlParts = {
  pathname: string;
  search?: string;
};

export function toUrlString(url: UrlParts) {
  return `${url.pathname}${url.search ?? ""}`;
}

type RouteWithUrl<TParams extends unknown[] = []> = {
  $url: (...args: TParams) => UrlParts;
};

export function buildUrl<TParams extends unknown[] = []>(
  route: RouteWithUrl<TParams>,
  ...params: TParams
) {
  return toUrlString(route.$url(...params));
}

import { AppRoute, ParamsFromUrl } from "@ts-rest/core";

export function tsBuildUrl<TRoute extends AppRoute, TParams extends ParamsFromUrl<TRoute["path"]>>(
  route: TRoute,
  params: TParams
): string {
  let path = route.path;

  // Replace :paramName and :paramName? with actual values
  // This regex matches :paramName or :paramName? and replaces with the param value
  path = path.replace(/\/?:([^/?]+)\??/g, (matched, paramName) => {
    const value = params[paramName as keyof TParams];
    if (value !== undefined && value !== null) {
      return matched.startsWith("/") ? `/${String(value)}` : String(value);
    }
    return matched;
  });

  return path;
}

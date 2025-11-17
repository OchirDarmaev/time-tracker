import {
  AppRoute,
  ClientInferRequest,
  convertQueryParamsToUrlString,
  insertParamsIntoPath,
} from "@ts-rest/core";

export function tsBuildUrl<
  TRoute extends AppRoute,
  TRequest extends Omit<ClientInferRequest<TRoute>, "body">,
>(route: TRoute, request: TRequest): string {
  const path = insertParamsIntoPath({ path: route.path, params: request.params });
  const query = convertQueryParamsToUrlString(request.query);
  return path + query;
}

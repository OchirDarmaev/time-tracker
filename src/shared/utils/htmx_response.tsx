import { AuthContext } from "@/shared/middleware/auth_stub.js";
import { Layout } from "./layout.js";

type HtmlContent = string | JSX.Element;

/**
 * Handles HTMX response pattern: returns content only for HTMX requests,
 * or wrapped in Layout for full page requests.
 */
export function htmxResponse<T extends { headers?: Record<string, string | string[] | undefined> }>(
  req: T,
  content: HtmlContent,
  authReq: AuthContext,
  activeNav: string = ""
): {
  status: 200;
  body: string;
} {
  const headers = req.headers || {};
  const hxRequest = headers["hx-request"];
  const isHtmxRequest =
    hxRequest === "true" || (Array.isArray(hxRequest) && hxRequest[0] === "true");

  if (isHtmxRequest) {
    return {
      status: 200,
      body: String(content),
    };
  }

  return {
    status: 200,
    body: String(<Layout content={content} req={authReq} activeNav={activeNav} />),
  };
}

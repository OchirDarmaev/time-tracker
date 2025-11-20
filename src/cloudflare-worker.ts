import type {
  Request as WorkerRequest,
  ExecutionContext,
  KVNamespace,
} from "@cloudflare/workers-types/experimental";
import { fetchRequestHandler, tsr } from "@ts-rest/serverless/fetch";
import { rootContract } from "./features/root/contract";
import { renderRoot } from "./features/root/views/render-root";

interface Env {
  MY_KV_NAMESPACE: KVNamespace;
}

const router = tsr
  .platformContext<{
    workerRequest: WorkerRequest;
    workerEnv: Env;
    workerContext: ExecutionContext;
  }>()
  .router(rootContract, {
    root: async () => {
      const html = renderRoot();
      return {
        status: 200,
        body: String(html),
      };
    },
  });

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    return fetchRequestHandler({
      request,
      contract: rootContract,
      router,
      platformContext: {
        workerRequest: request as unknown as WorkerRequest,
        workerEnv: env,
        workerContext: ctx,
      },
      options: {
        jsonQuery: true,
        responseValidation: true,
      },
    });
  },
};

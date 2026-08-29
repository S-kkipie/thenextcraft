import {
  CopilotRuntime,
  OpenAIAdapter,
  copilotRuntimeNextJSAppRouterEndpoint,
} from "@copilotkit/runtime";
import OpenAI from "openai";

// The OpenAI key never lives here. We point the client at the Convex `/openai`
// httpAction proxy, which injects the real key (Convex deployment env) and
// streams responses back. Derive the `.convex.site` host from the deployment URL.
const convexSite =
  process.env.CONVEX_SITE_URL ??
  process.env.NEXT_PUBLIC_CONVEX_URL?.replace(/\.cloud$/, ".site");

const openai = new OpenAI({
  apiKey: "convex-proxy", // placeholder; real key is added by the Convex proxy
  baseURL: convexSite ? `${convexSite}/openai` : undefined,
});

const serviceAdapter = new OpenAIAdapter({ openai, model: "gpt-4o-mini" });
const runtime = new CopilotRuntime();

export const POST = async (req: Request) => {
  const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
    runtime,
    serviceAdapter,
    endpoint: "/api/copilotkit",
  });
  return handleRequest(req);
};

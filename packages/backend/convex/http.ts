import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { auth } from "./auth";

// Convex' tsconfig has no Node globals; `process.env` is available at runtime.
declare const process: { env: Record<string, string | undefined> };

const OPENAI_BASE = "https://api.openai.com/v1";

// Thin OpenAI proxy so the CopilotKit runtime (Next route) never holds the key.
// The Next server points its OpenAI client's baseURL at `${CONVEX_SITE_URL}/openai`;
// here we inject the real `OPENAI_API_KEY` (Convex deployment env) and stream the
// response straight back — including SSE token streams for the copilot chat.
const openaiProxy = httpAction(async (_ctx, req) => {
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    return new Response(JSON.stringify({ error: "OPENAI_API_KEY no configurado en Convex" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const url = new URL(req.url);
  const subpath = url.pathname.slice("/openai".length); // e.g. "/chat/completions"
  const body = await req.text();

  const upstream = await fetch(`${OPENAI_BASE}${subpath}${url.search}`, {
    method: req.method,
    headers: {
      "Content-Type": req.headers.get("Content-Type") ?? "application/json",
      Accept: req.headers.get("Accept") ?? "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: body.length > 0 ? body : undefined,
  });

  // Pass the (possibly streamed) response through untouched.
  const headers = new Headers();
  const ct = upstream.headers.get("Content-Type");
  if (ct) headers.set("Content-Type", ct);
  return new Response(upstream.body, { status: upstream.status, headers });
});

const http = httpRouter();

// Mounts /api/auth/* (OAuth start + callback, token refresh, sign-out).
auth.addHttpRoutes(http);

// OpenAI passthrough for the CopilotKit runtime (POST /openai/*).
http.route({ pathPrefix: "/openai/", method: "POST", handler: openaiProxy });

export default http;

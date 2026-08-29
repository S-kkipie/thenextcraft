// Convex Auth config. A missing/incorrect one makes the app silently
// always-signed-out — CONVEX_SITE_URL is auto-provided by the deployment.
declare const process: { env: Record<string, string | undefined> };

export default {
  providers: [
    {
      domain: process.env.CONVEX_SITE_URL,
      applicationID: "convex",
    },
  ],
};

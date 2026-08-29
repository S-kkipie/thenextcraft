import { defineApp } from "convex/server";
import { v } from "convex/values";

const app = defineApp({
  env: {
    OPENAI_API_KEY: v.string(),
    OPENAI_MODEL: v.optional(v.string()),
    GITHUB_TOKEN: v.optional(v.string()),
  },
});

export default app;

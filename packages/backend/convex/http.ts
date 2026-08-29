import { httpRouter } from "convex/server";
import { auth } from "./auth";

const http = httpRouter();

// Mounts /api/auth/* (OAuth start + callback, token refresh, sign-out).
auth.addHttpRoutes(http);

export default http;

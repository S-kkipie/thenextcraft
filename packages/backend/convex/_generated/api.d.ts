/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as auth from "../auth.js";
import type * as badges from "../badges.js";
import type * as challenges from "../challenges.js";
import type * as domain from "../domain.js";
import type * as evaluations from "../evaluations.js";
import type * as feed from "../feed.js";
import type * as http from "../http.js";
import type * as jobs from "../jobs.js";
import type * as leaderboard from "../leaderboard.js";
import type * as opportunities from "../opportunities.js";
import type * as rankings from "../rankings.js";
import type * as shortlist from "../shortlist.js";
import type * as startup from "../startup.js";
import type * as submissions from "../submissions.js";
import type * as technicalJudge from "../technicalJudge.js";
import type * as users from "../users.js";
import type * as views from "../views.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  badges: typeof badges;
  challenges: typeof challenges;
  domain: typeof domain;
  evaluations: typeof evaluations;
  feed: typeof feed;
  http: typeof http;
  jobs: typeof jobs;
  leaderboard: typeof leaderboard;
  opportunities: typeof opportunities;
  rankings: typeof rankings;
  shortlist: typeof shortlist;
  startup: typeof startup;
  submissions: typeof submissions;
  technicalJudge: typeof technicalJudge;
  users: typeof users;
  views: typeof views;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};

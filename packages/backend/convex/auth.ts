import GitHub from "@auth/core/providers/github";
import { convexAuth } from "@convex-dev/auth/server";
import type { Id } from "./_generated/dataModel";
import type { MutationCtx } from "./_generated/server";

function optionalString(value: unknown) {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    GitHub({
      // Identity only: GitHub's basic profile and primary email. No repo scope.
      authorization: { params: { scope: "read:user user:email" } },
      profile(profile) {
        return {
          id: profile.id.toString(),
          name: profile.name ?? profile.login,
          email: profile.email ?? undefined,
          image: profile.avatar_url,
          githubHandle: profile.login.toLowerCase(),
          avatarUrl: profile.avatar_url,
        };
      },
    }),
  ],
  callbacks: {
    async createOrUpdateUser(ctx: MutationCtx, args) {
      const now = Date.now();
      const name = optionalString(args.profile.name);
      const email = optionalString(args.profile.email);
      const image = optionalString(args.profile.image);
      const githubHandle = optionalString(args.profile.githubHandle)?.toLowerCase();

      let userId = args.existingUserId as Id<"users"> | null;
      if (userId === null && githubHandle) {
        userId =
          (
            await ctx.db
              .query("users")
              .withIndex("by_githubHandle", (q) =>
                q.eq("githubHandle", githubHandle),
              )
              .unique()
          )?._id ?? null;
      }

      const profilePatch = {
        name: name ?? githubHandle ?? "GitHub user",
        email,
        image,
        githubHandle,
        avatarUrl: image,
        updatedAt: now,
      };

      if (userId !== null) {
        await ctx.db.patch("users", userId, profilePatch);
        return userId;
      }

      return await ctx.db.insert("users", {
        ...profilePatch,
        level: 1,
        xp: 0,
        streak: 0,
        skills: [],
      });
    },
  },
});

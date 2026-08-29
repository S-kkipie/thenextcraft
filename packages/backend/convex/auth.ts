import GitHub from "@auth/core/providers/github";
import { convexAuth } from "@convex-dev/auth/server";

// Convex Auth — GitHub OAuth. createOrUpdateUser maps the GitHub profile into
// our app `users` row and preserves app fields (role/level/xp/streak) on re-login.
export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    GitHub({
      profile(githubProfile) {
        return {
          id: String(githubProfile.id),
          name: (githubProfile.name ?? githubProfile.login) as string,
          githubHandle: githubProfile.login as string,
          avatarUrl: githubProfile.avatar_url as string,
        };
      },
    }),
  ],
  callbacks: {
    async createOrUpdateUser(ctx, { existingUserId, profile }) {
      const now = Date.now();
      const name =
        typeof profile.name === "string" && profile.name
          ? profile.name
          : "Builder";
      const githubHandle =
        typeof profile.githubHandle === "string"
          ? profile.githubHandle
          : undefined;
      const avatarUrl =
        typeof profile.avatarUrl === "string" ? profile.avatarUrl : undefined;

      // Existing auth user → refresh profile bits, keep role/level/xp/streak.
      if (existingUserId) {
        await ctx.db.patch(existingUserId, { name, avatarUrl, updatedAt: now });
        return existingUserId;
      }

      // New user: default role builder; onboarding lets them switch to startup.
      return await ctx.db.insert("users", {
        name,
        githubHandle,
        avatarUrl,
        role: "builder",
        onboarded: false,
        level: 1,
        xp: 0,
        streak: 0,
        skills: [],
        updatedAt: now,
      });
    },
  },
});

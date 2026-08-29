import { TopNav } from "@/components/top-nav";
import { AuthGuard } from "@/components/auth-guard";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full flex-col">
      <TopNav />
      <div className="mx-auto w-full max-w-5xl flex-1 px-6 py-8">
        <AuthGuard>{children}</AuthGuard>
      </div>
    </div>
  );
}

import { TopNav } from "@/components/top-nav";
import { AuthGuard } from "@/components/auth-guard";
import { ViewErrorBoundary } from "@/components/craft/view-error";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full flex-col">
      <TopNav />
      <div className="mx-auto w-full max-w-5xl flex-1 px-6 py-8">
        {/* El boundary va DENTRO del layout: si una vista revienta, el nav y el
            prompt de ruta siguen ahí y hay por dónde salir. */}
        <ViewErrorBoundary>
          <AuthGuard>{children}</AuthGuard>
        </ViewErrorBoundary>
      </div>
    </div>
  );
}

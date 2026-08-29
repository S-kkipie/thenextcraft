import { AppSidebar, MobileNav } from "@/components/craft/app-sidebar";

/**
 * Shell de la app autenticada. La landing (`/`) queda fuera de este grupo.
 */
export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex flex-1 flex-col md:flex-row">
      <AppSidebar />
      <MobileNav />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

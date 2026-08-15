import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import AppSidebar from "@/components/sidebar";
import RequireAuth from "@/components/auth/require-auth";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="flex min-h-svh min-w-0 flex-col">
        <RequireAuth>{children}</RequireAuth>
      </SidebarInset>
    </SidebarProvider>
  );
}

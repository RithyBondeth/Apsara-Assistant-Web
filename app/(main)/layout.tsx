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
      <SidebarInset className="flex flex-col min-h-screen">
        <RequireAuth>{children}</RequireAuth>
      </SidebarInset>
    </SidebarProvider>
  );
}

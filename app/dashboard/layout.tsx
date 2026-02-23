import { DashboardSidebar } from "@/components/DashboardSidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-4 p-4 md:flex-row">
      <DashboardSidebar />
      <section className="flex-1">{children}</section>
    </main>
  );
}
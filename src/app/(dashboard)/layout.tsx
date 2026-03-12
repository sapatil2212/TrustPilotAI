import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { TrialModal } from "@/components/trial/trial-modal";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-[#0f0f14]">
      {/* Desktop Sidebar - Fixed position */}
      <div className="hidden lg:block w-72 shrink-0">
        <div className="fixed left-0 top-0 h-screen w-72">
          <Sidebar />
        </div>
      </div>
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-0">
        <Header />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
      
      <TrialModal />
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAuthStore } from "@/src/store/auth";
import { Sidebar } from "@/src/components/layout/Sidebar";
import { BottomTabBar } from "@/src/components/layout/BottomTabBar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000,
            retry: 1,
          },
        },
      }),
  );

  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, router]);

  // Prevent rendering dashboard content before redirect completes
  if (!isAuthenticated) return null;

  return (
    <QueryClientProvider client={queryClient}>
      <div
        className="flex flex-1"
        style={{ background: "var(--color-bg-app)" }}
      >
        {/* Desktop sidebar — hidden on mobile via Sidebar's className */}
        <Sidebar />

        {/* Main content area */}
        <main
          className="flex-1 min-w-0 p-4 md:p-8"
          style={{
            // Keeps content above the fixed mobile tab bar on all screen sizes.
            // On desktop the tab bar is hidden but the extra padding is harmless.
            paddingBottom: "calc(56px + env(safe-area-inset-bottom))",
          }}
        >
          {children}
        </main>

        {/* Mobile bottom tab bar — hidden on desktop via BottomTabBar's className */}
        <BottomTabBar />
      </div>
    </QueryClientProvider>
  );
}

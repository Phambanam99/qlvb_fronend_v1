"use client";

import type React from "react";

import { useAuth } from "@/lib/auth-context";
import { Header } from "@/components/header";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import NotificationsProviderDynamic from "@/lib/notifications-provider.dynamic";

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, loading, dataLoading, setDataLoaded, user } =
    useAuth();
  const router = useRouter();
  const [initialCheckDone, setInitialCheckDone] = useState(false);
  const hasSetDataLoaded = useRef(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/dang-nhap");
    }
  }, [isAuthenticated, loading, router]);

  // Set data loaded immediately when user is available
  useEffect(() => {
    if (isAuthenticated && user && dataLoading && !hasSetDataLoaded.current) {
      hasSetDataLoaded.current = true;
      setDataLoaded();
    }
  }, [isAuthenticated, user, dataLoading, setDataLoaded]);

  // Mark initial check as done once authentication completes
  useEffect(() => {
    if (!loading && !dataLoading) {
      setInitialCheckDone(true);
    }
  }, [loading, dataLoading]);

  // Only show loading screen during initial authentication check
  if (!initialCheckDone && (loading || dataLoading)) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-sm text-muted-foreground">
            {loading ? "Đang xác thực..." : "Đang tải dữ liệu..."}
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <NotificationsProviderDynamic>
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 overflow-auto px-6 py-6 bg-gray-100 dark:bg-gray-900">
          {children}
        </main>
      </div>
    </NotificationsProviderDynamic>
  );
}

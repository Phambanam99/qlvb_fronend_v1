"use client";

import type React from "react";

import { useAuth } from "@/lib/auth-context";
import { Header } from "@/components/header";
import Sidebar from "@/components/sidebar";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { NotificationsProvider } from "@/lib/notifications-context";
import { MainSidebar } from "@/components/main-sidebar";
export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, loading, dataLoading, setDataLoaded, user } =
    useAuth();
  const router = useRouter();
  const [renderContent, setRenderContent] = useState(false);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/dang-nhap");
    }
  }, [isAuthenticated, loading, router]);

  // Effect to track when to safely render content
  useEffect(() => {
    // Chỉ hiển thị nội dung khi đã xác thực và tải xong dữ liệu
    if (isAuthenticated && !loading && !dataLoading) {
      console.log("✅ Tất cả dữ liệu đã tải xong - sẵn sàng hiển thị nội dung");
      setRenderContent(true);
    } else {
      setRenderContent(false);
    }
  }, [isAuthenticated, loading, dataLoading]);

  // Effect to fetch initial data once authenticated
  useEffect(() => {
    const loadInitialData = async () => {
      if (isAuthenticated && user && dataLoading) {
        try {
          console.log("🔄 Đang tải dữ liệu ứng dụng...");

          // Chờ đợi tất cả các data loading process từ dashboard
          // Không tự đánh dấu là đã tải xong ở đây, để dashboard quyết định
          await new Promise((resolve) => setTimeout(resolve, 1500));

          // Nếu sau 5 giây mà vẫn chưa tải xong, đánh dấu đã tải xong để tránh đợi mãi mãi
          const timeoutId = setTimeout(() => {
            console.log(
              "⚠️ Thời gian tải dữ liệu vượt quá giới hạn - đánh dấu đã tải xong"
            );
            setDataLoaded();
          }, 1000);

          // Nếu dashboard đã đánh dấu là đã tải xong, hủy timeout
          return () => clearTimeout(timeoutId);
        } catch (error) {
          console.error("⛔ Lỗi khi tải dữ liệu ban đầu:", error);
          setDataLoaded(); // Đánh dấu đã tải xong để tránh loading mãi
        }
      }
    };

    loadInitialData();
  }, [isAuthenticated, dataLoading, setDataLoaded, user]);

  // Show loading spinner for both auth loading and data loading
  if (loading || dataLoading || !renderContent) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-sm text-muted-foreground">
            {loading
              ? "Đang xác thực..."
              : dataLoading
              ? "Đang tải dữ liệu..."
              : "Đang chuẩn bị hiển thị..."}
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <NotificationsProvider>
      <div className="flex min-h-screen flex-col">
        <Header />

        <div className="flex flex-1">
          <Sidebar />
          <main className="flex-1 overflow-auto p-6">{children}</main>
        </div>
      </div>
    </NotificationsProvider>
  );
}

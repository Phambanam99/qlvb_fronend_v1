"use client";

import type React from "react";

import { useAuth } from "@/lib/auth-context";
import { Header } from "@/components/header";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { NotificationsProvider } from "@/lib/notifications-context";

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
      // console.log("✅ Tất cả dữ liệu đã tải xong - sẵn sàng hiển thị nội dung");
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
        
          const timeoutId = setTimeout(() => {
            // console.log(
            //   "⚠️ Thời gian tải dữ liệu vượt quá giới hạn - đánh dấu đã tải xong"
            // );
            // Đánh dấu dữ liệu đã tải xong
            setDataLoaded();

            // Force reload trang nếu cần thiết để đảm bảo dữ liệu được hiển thị
            if (window.location.pathname === "/") {
              console.log(
                "🔄 Tải lại trang dashboard để đảm bảo dữ liệu hiển thị đúng"
              );
              // window.location.reload(); // có thể uncomment nếu vẫn gặp vấn đề
            }
          }, 1000); // Tăng timeout lên 5 giây

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
        <main className="flex-1 overflow-auto p-6 bg-gray-50/50">
          {children}
        </main>
      </div>
    </NotificationsProvider>
  );
}

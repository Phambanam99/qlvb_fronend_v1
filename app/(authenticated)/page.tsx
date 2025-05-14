"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  FileText,
  Calendar,
  ClipboardList,
  Send,
  Loader2,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { dashboardAPI } from "@/lib/api";
import { incomingDocumentsAPI } from "@/lib/api";
import { schedulesAPI } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import { useDashboard } from "@/lib/store";
import { useAuth } from "@/lib/auth-context";

// Danh sách vai trò có quyền xem bảng điều khiển đầy đủ
const FULL_ACCESS_ROLES = [
  "ROLE_ADMIN",
  "ROLE_VAN_THU",
  "ROLE_CUC_TRUONG",
  "ROLE_CUC_PHO",
  "ROLE_CHINH_UY",
  "ROLE_PHO_CHINH_UY",
];

// Danh sách vai trò có quyền xem dữ liệu phòng ban
const DEPARTMENT_ACCESS_ROLES = [
  "ROLE_TRUONG_PHONG",
  "ROLE_PHO_PHONG",
  "ROLE_TRUONG_BAN",
  "ROLE_PHO_BAN",
];

// Danh sách vai trò có quyền xem dữ liệu cá nhân
const PERSONAL_ACCESS_ROLES = ["ROLE_NHAN_VIEN", "ROLE_TRO_LY"];

export default function Home() {
  const { toast } = useToast();
  const { user, hasRole, setDataLoaded } = useAuth();
  const {
    stats,
    recentDocuments,
    todayEvents,
    loading,
    error,
    setStats,
    setRecentDocuments,
    setTodayEvents,
    setLoading,
    setError,
  } = useDashboard();

  // State để theo dõi trạng thái loading chi tiết
  const [isStatsLoading, setIsStatsLoading] = useState(true);
  const [isDocumentsLoading, setIsDocumentsLoading] = useState(true);
  const [isEventsLoading, setIsEventsLoading] = useState(true);
  const [isUserLoaded, setIsUserLoaded] = useState(false);

  // Xác định quyền truy cập của người dùng
  const hasFullAccess = FULL_ACCESS_ROLES.some((role) => hasRole(role));
  const hasDepartmentAccess = DEPARTMENT_ACCESS_ROLES.some((role) =>
    hasRole(role)
  );
  const hasPersonalAccess = PERSONAL_ACCESS_ROLES.some((role) => hasRole(role));

  // Xác định xem người dùng có quyền xem bảng điều khiển không
  const canViewDashboard =
    hasFullAccess || hasDepartmentAccess || hasPersonalAccess;

  // Cập nhật trạng thái user loaded sau khi user được fetch
  useEffect(() => {
    if (user) {
      console.log("👤 Thông tin người dùng đã tải xong:", {
        id: user.id,
        name: user.fullName,
        roles: user.roles,
        department: user.departmentId,
      });

      // Đảm bảo ở useEffect tiếp theo isUserLoaded đã thay đổi
      // bằng cách dùng setTimeout để đẩy vào cuối event loop
      setTimeout(() => {
        setIsUserLoaded(true);
      }, 0);
    }
  }, [user]);

  // Cập nhật trạng thái loading tổng thể
  useEffect(() => {
    // Chỉ đặt loading = false khi tất cả dữ liệu đã tải xong
    const isFullyLoaded =
      isUserLoaded &&
      !isStatsLoading &&
      !isDocumentsLoading &&
      !isEventsLoading;

    console.log("Trạng thái loading của dashboard:", {
      isUserLoaded,
      isStatsLoading,
      isDocumentsLoading,
      isEventsLoading,
      isFullyLoaded,
    });

    setLoading(!isFullyLoaded);

    // Thông báo cho AuthContext khi dữ liệu đã tải xong
    if (isFullyLoaded) {
      // Đánh dấu dữ liệu đã tải xong trong AuthContext
      setDataLoaded();
    }
  }, [
    isStatsLoading,
    isDocumentsLoading,
    isEventsLoading,
    isUserLoaded,
    setLoading,
    setDataLoaded,
  ]);

  // Theo dõi các thay đổi quan trọng để biết khi nào nên tải lại dữ liệu
  useEffect(() => {
    // Không làm gì nếu user chưa tải xong
    if (!user) {
      console.log("Dashboard: Chưa có thông tin user, đợi tải...");
      return;
    }

    console.log("Dashboard: User đã được tải, bắt đầu tải dữ liệu", {
      userId: user.id,
      name: user.fullName || user.name,
      roles: user.roles,
      isUserLoaded,
      canViewDashboard,
    });

    // Gọi hàm fetch data khi có user
    fetchDashboardData();

    // Không cần thiết phải monitor trạng thái loading vì chúng ta đã có user
    return () => {
      console.log("Dashboard: Cleanup data fetching");
    };
  }, [user?.id]); // Chỉ phụ thuộc vào user.id để tránh re-render không cần thiết

  const fetchDashboardData = async () => {
    try {
      // Nếu người dùng không có quyền xem bảng điều khiển, không tải dữ liệu
      if (!canViewDashboard) {
        console.log("User does not have permission to view dashboard");
        setIsStatsLoading(false);
        setIsDocumentsLoading(false);
        setIsEventsLoading(false);
        setError("Bạn không có quyền xem bảng điều khiển");
        return;
      }

      if (!user) {
        console.log("Đang đợi thông tin người dùng...");
        return; // Chờ cho đến khi user được tải xong
      }

      console.log("Bắt đầu tải dữ liệu dashboard:", new Date().toISOString());
      // Đặt tất cả các thành phần thành trạng thái loading và xóa lỗi
      setIsStatsLoading(true);
      setIsDocumentsLoading(true);
      setIsEventsLoading(true);
      setError(null);

      // PHẦN 1: TẢI THỐNG KÊ BẢNG ĐIỀU KHIỂN
      console.log("1️⃣ Đang tải thống kê bảng điều khiển...");
      try {
        let dashboardStats;

        if (hasFullAccess) {
          // Admin, văn thư, cục trưởng: xem tất cả dữ liệu
          console.log("Tải thống kê đầy đủ cho admin/cục trưởng");
          dashboardStats = await dashboardAPI.getDashboardStatistics();
        } else if (hasDepartmentAccess && user?.departmentId) {
          // Trưởng phòng, phó phòng: chỉ xem dữ liệu của phòng ban
          console.log("Tải thống kê cho phòng ban:", user.departmentId);
          // Hiện tại chưa có API riêng nên vẫn dùng API chung
          dashboardStats = await dashboardAPI.getDashboardStatistics();
        } else if (hasPersonalAccess && user?.id) {
          // Nhân viên, trợ lý: chỉ xem dữ liệu cá nhân
          console.log("Tải thống kê cho nhân viên ID:", user.id);
          dashboardStats = await dashboardAPI.getDashboardStatistics();
        } else {
          // Fallback - trả về dữ liệu rỗng
          dashboardStats = {
            incomingDocumentCount: 0,
            pendingDocumentCount: 0,
            outgoingDocumentCount: 0,
            workCaseCount: 0,
          };
        }

        if (dashboardStats) {
          console.log("✅ Hoàn tất tải thống kê:", dashboardStats);
          // Cập nhật thống kê dựa trên dữ liệu đã lọc
          setStats({
            incomingDocuments: {
              total: dashboardStats.incomingDocumentCount || 0,
              pending: dashboardStats.pendingDocumentCount || 0,
            },
            outgoingDocuments: {
              total: dashboardStats.outgoingDocumentCount || 0,
              pending: dashboardStats.pendingDocumentCount || 0,
            },
            workPlans: {
              total: dashboardStats.workCaseCount || 0,
              active: dashboardStats.workCaseCount
                ? Math.floor(dashboardStats.workCaseCount * 0.7)
                : 0,
            },
            schedules: {
              total: dashboardStats.scheduleCount || 0,
              today: dashboardStats.todayScheduleCount || 0,
            },
          });
        } else {
          console.error(
            "Nhận được dữ liệu thống kê không hợp lệ:",
            dashboardStats
          );
          setStats({
            incomingDocuments: { total: 0, pending: 0 },
            outgoingDocuments: { total: 0, pending: 0 },
            workPlans: { total: 0, active: 0 },
            schedules: { total: 0, today: 0 },
          });
        }
      } catch (statsError) {
        console.error("❌ Lỗi khi tải thống kê bảng điều khiển:", statsError);
        setStats({
          incomingDocuments: { total: 0, pending: 0 },
          outgoingDocuments: { total: 0, pending: 0 },
          workPlans: { total: 0, active: 0 },
          schedules: { total: 0, today: 0 },
        });
      } finally {
        // Đánh dấu thống kê đã tải xong dù có lỗi hay không
        setIsStatsLoading(false);
      }

      // PHẦN 2: TẢI DANH SÁCH VĂN BẢN GẦN ĐÂY
      console.log("2️⃣ Đang tải danh sách văn bản...");
      try {
        let incomingDocs;

        if (hasFullAccess) {
          incomingDocs = await incomingDocumentsAPI.getAllDocuments(0, 5);
          console.log("Đã tải văn bản với quyền admin:", incomingDocs);
        } else if (hasDepartmentAccess && user?.departmentId) {
          incomingDocs = await incomingDocumentsAPI.getDepartmentDocuments(
            user.departmentId,
            0,
            5
          );
          console.log("Đã tải văn bản với quyền phòng/ban:", incomingDocs);
        } else if (hasPersonalAccess && user?.id) {
          // Lấy danh sách văn bản được phân công cho nhân viên
          if (user.departmentId) {
            incomingDocs = await incomingDocumentsAPI.getDepartmentDocuments(
              user.departmentId,
              0,
              10
            );
            console.log(
              "Đã tải văn bản phòng/ban để lọc theo người dùng:",
              incomingDocs
            );

            // Lọc chỉ văn bản được phân công cho user
            if (incomingDocs && incomingDocs.content) {
              incomingDocs.content = incomingDocs.content.filter(
                (doc: any) =>
                  doc.assignedToIds &&
                  Array.isArray(doc.assignedToIds) &&
                  doc.assignedToIds.includes(user.id)
              );
            }
          } else {
            // Nếu không có departmentId, trả về danh sách rỗng
            incomingDocs = { content: [] };
          }
        } else {
          incomingDocs = { content: [] };
        }

        // Kiểm tra và xử lý kết quả
        if (incomingDocs && Array.isArray(incomingDocs.content)) {
          console.log("✅ Hoàn tất tải văn bản mới:", {
            total: incomingDocs.content.length,
            data: incomingDocs.content.slice(0, 3),
          });

          // Cập nhật danh sách văn bản gần đây, tối đa 3 văn bản
          setRecentDocuments(
            incomingDocs.content.slice(0, 3).map((doc: any) => ({
              id: doc.id,
              number: doc.documentNumber || "Chưa có số",
              title: doc.title || "Không có tiêu đề",
              status: doc.processingStatus || "new",
            }))
          );
        } else {
          console.error("Dữ liệu văn bản không hợp lệ:", incomingDocs);
          setRecentDocuments([]);
        }
      } catch (docsError) {
        console.error("❌ Lỗi khi tải danh sách văn bản:", docsError);
        setRecentDocuments([]);
      } finally {
        // Đánh dấu văn bản đã tải xong dù có lỗi hay không
        setIsDocumentsLoading(false);
      }

      // PHẦN 3: TẢI SỰ KIỆN TRONG NGÀY
      console.log("3️⃣ Đang tải sự kiện trong ngày...");
      try {
        const today = new Date().toISOString().split("T")[0];
        let events = [];

        // Gọi API để lấy sự kiện trong ngày (nếu có API thì bỏ comment)
        // events = await schedulesAPI.getScheduleEvents({ date: today });

        if (Array.isArray(events) && events.length > 0) {
          console.log("✅ Đã tải sự kiện trong ngày:", events.length);
          setTodayEvents(
            events.slice(0, 2).map((event: any) => ({
              id: event.id,
              title: event.title || "Không có tiêu đề",
              time: event.startTime || "00:00",
              location: event.location || "Không có địa điểm",
            }))
          );
        } else {
          console.log("Không có sự kiện nào trong ngày hoặc API chưa sẵn sàng");
          setTodayEvents([]);
        }
      } catch (eventError) {
        console.error("❌ Lỗi khi tải sự kiện:", eventError);
        setTodayEvents([]);
      } finally {
        // Đánh dấu sự kiện đã tải xong dù có lỗi hay không
        setIsEventsLoading(false);
      }

      console.log(
        "✅ Đã tải xong tất cả dữ liệu dashboard",
        new Date().toISOString()
      );
    } catch (generalError) {
      console.error("❌ Lỗi tổng thể khi tải dữ liệu dashboard:", generalError);
      setError("Không thể tải dữ liệu bảng điều khiển. Vui lòng thử lại sau.");
      toast({
        title: "Lỗi",
        description:
          "Không thể tải dữ liệu bảng điều khiển. Vui lòng thử lại sau.",
        variant: "destructive",
      });
    } finally {
      // Đảm bảo tất cả đều được đánh dấu là đã hoàn thành, kể cả khi có lỗi
      setIsStatsLoading(false);
      setIsDocumentsLoading(false);
      setIsEventsLoading(false);
    }
  };

  // Cập nhật điều kiện hiển thị loading thay vì phụ thuộc vào loading state trong useDashboard
  const showLoading =
    isStatsLoading || isDocumentsLoading || isEventsLoading || !user;

  // Xử lý trường hợp không có dữ liệu hiển thị rõ ràng
  if (
    !showLoading &&
    stats.incomingDocuments.total === 0 &&
    stats.outgoingDocuments.total === 0
  ) {
    return (
      <div className="space-y-8">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold">Bảng điều khiển</h1>
          <p className="text-muted-foreground">
            Quản lý văn bản và công tác của đơn vị
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="card-hover">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Văn bản đến</CardTitle>
              <FileText className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground mt-1">
                0 văn bản chưa xử lý
              </p>
            </CardContent>
          </Card>
          <Card className="card-hover">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Văn bản đi</CardTitle>
              <Send className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground mt-1">
                0 văn bản chờ duyệt
              </p>
            </CardContent>
          </Card>
          <Card className="card-hover">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Kế hoạch</CardTitle>
              <ClipboardList className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground mt-1">
                0 kế hoạch đang thực hiện
              </p>
            </CardContent>
          </Card>
          <Card className="card-hover">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Lịch công tác
              </CardTitle>
              <Calendar className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground mt-1">
                0 lịch công tác hôm nay
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Thông báo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
              <div className="flex items-center space-x-4">
                <AlertCircle className="h-6 w-6 text-amber-600" />
                <div>
                  <p className="font-medium text-amber-900">
                    Chưa có dữ liệu văn bản
                  </p>
                  <p className="text-sm text-amber-800 mt-1">
                    Hiện chưa có văn bản nào trong hệ thống. Các chức năng vẫn
                    đang hoạt động bình thường.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Điều kiện hiển thị loading
  if (showLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="mt-2 text-sm text-muted-foreground">
            Đang tải dữ liệu...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="text-center">
          <div className="rounded-full bg-red-100 p-3 mx-auto w-16 h-16 flex items-center justify-center">
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>
          <h2 className="mt-4 text-xl font-semibold">Đã xảy ra lỗi</h2>
          <p className="mt-2 text-sm text-muted-foreground">{error}</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Thử lại
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold">Bảng điều khiển</h1>
        <p className="text-muted-foreground">
          Quản lý văn bản và công tác của đơn vị
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Văn bản đến</CardTitle>
            <FileText className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.incomingDocuments.total}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.incomingDocuments.pending} văn bản chưa xử lý
            </p>
          </CardContent>
        </Card>
        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Văn bản đi</CardTitle>
            <Send className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.outgoingDocuments.total}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.outgoingDocuments.pending} văn bản chờ duyệt
            </p>
          </CardContent>
        </Card>
        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kế hoạch</CardTitle>
            <ClipboardList className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.workPlans.total}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.workPlans.active} kế hoạch đang thực hiện
            </p>
          </CardContent>
        </Card>
        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lịch công tác</CardTitle>
            <Calendar className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.schedules.total}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.schedules.today} lịch công tác hôm nay
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-1 md:col-span-2">
          <CardHeader>
            <CardTitle>Văn bản cần xử lý</CardTitle>
            <CardDescription>
              Danh sách văn bản đến cần được xử lý
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentDocuments.length > 0 ? (
              <div className="space-y-6">
                {recentDocuments.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between border-b pb-4"
                  >
                    <div>
                      <p className="font-medium">{doc.number}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {doc.title}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="rounded-full"
                      asChild
                    >
                      <Link href={`/van-ban-den/${doc.id}`}>
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Không có văn bản nào cần xử lý
              </p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Lịch công tác hôm nay</CardTitle>
            <CardDescription>Các sự kiện trong ngày</CardDescription>
          </CardHeader>
          <CardContent>
            {todayEvents.length > 0 ? (
              <div className="space-y-6">
                {todayEvents.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-start space-x-4 border-b pb-4"
                  >
                    <div className="flex flex-col items-center">
                      <div className="text-sm font-medium bg-accent rounded-full w-12 h-12 flex items-center justify-center">
                        {event.time}
                      </div>
                      <div className="h-full w-px bg-border mt-1"></div>
                    </div>
                    <div>
                      <p className="font-medium">{event.title}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {event.location}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Không có sự kiện nào hôm nay
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

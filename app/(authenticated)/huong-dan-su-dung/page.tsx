"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  HelpCircle,
  FileText,
  Send,
  ClipboardList,
  Calendar,
  Users,
  Settings,
  Building,
  UserCheck,
  Download,
  Phone,
  User,
  MapPin,
} from "lucide-react";

export default function UserGuidePage() {
  const [activeSection, setActiveSection] = useState("overview");

  const sections = [
    {
      id: "overview",
      title: "Tổng quan hệ thống",
      icon: HelpCircle,
      content: (
        <div className="space-y-4">
          <p className="text-muted-foreground">
            Hệ thống Quản lý văn bản điện tử giúp tự động hóa quy trình xử lý văn bản, 
            quản lý lịch công tác và kế hoạch trong tổ chức.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-800">Đăng nhập</h4>
              <p className="text-sm text-blue-600">
                Sử dụng tài khoản được cấp để đăng nhập vào hệ thống
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-semibold text-green-800">Dashboard</h4>
              <p className="text-sm text-green-600">
                Xem tổng quan thống kê và thông báo quan trọng
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "documents",
      title: "Quản lý văn bản",
      icon: FileText,
      content: (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Văn bản đến & Văn bản đi</h3>
          <ul className="space-y-2">
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              Tạo mới văn bản nội bộ và bên ngoài
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              Phân công xử lý văn bản đến
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              Theo dõi tiến độ xử lý
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              Lưu trữ và tìm kiếm văn bản
            </li>
          </ul>
        </div>
      ),
    },
    {
      id: "schedule",
      title: "Lịch công tác & Kế hoạch",
      icon: Calendar,
      content: (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Quản lý lịch công tác</h3>
          <ul className="space-y-2">
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              Tạo lịch công tác hàng tuần/tháng
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              Phê duyệt và theo dõi thực hiện
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              Báo cáo kết quả công tác
            </li>
          </ul>
          <h3 className="text-lg font-semibold mt-6">Quản lý kế hoạch</h3>
          <ul className="space-y-2">
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
              Lập kế hoạch dài hạn và ngắn hạn
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
              Phân công nhiệm vụ theo kế hoạch
            </li>
          </ul>
        </div>
      ),
    },
    {
      id: "users",
      title: "Quản lý người dùng & Vai trò",
      icon: Users,
      content: (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Quản lý người dùng</h3>
          <p className="text-muted-foreground text-sm">
            Chỉ dành cho quản trị viên
          </p>
          <ul className="space-y-2">
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-red-500 rounded-full"></span>
              Tạo tài khoản người dùng mới
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-red-500 rounded-full"></span>
              Phân quyền và vai trò
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-red-500 rounded-full"></span>
              Quản lý phòng ban và cơ cấu tổ chức
            </li>
          </ul>
        </div>
      ),
    },
  ];

  const guideFiles = [
    {
      name: "Hướng dẫn tổng quan hệ thống",
      description: "Giới thiệu chung về hệ thống và các chức năng cơ bản",
      type: "PDF",
      size: "2.5 MB",
    },
    {
      name: "Hướng dẫn quản lý văn bản",
      description: "Chi tiết cách tạo, xử lý và quản lý văn bản đến/đi",
      type: "PDF",
      size: "3.8 MB",
    },
    {
      name: "Hướng dẫn lập lịch công tác",
      description: "Cách tạo và quản lý lịch công tác hiệu quả",
      type: "PDF",
      size: "1.9 MB",
    },
    {
      name: "Video hướng dẫn sử dụng",
      description: "Video demo các chức năng chính của hệ thống",
      type: "Video",
      size: "45 MB",
    },
  ];

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Hướng dẫn sử dụng</h1>
        <p className="text-muted-foreground">
          Tài liệu hướng dẫn và thông tin liên hệ hỗ trợ
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Danh mục</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {sections.map((section) => (
              <Button
                key={section.id}
                variant={activeSection === section.id ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveSection(section.id)}
              >
                <section.icon className="mr-2 h-4 w-4" />
                {section.title}
              </Button>
            ))}
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Active Section Content */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {sections.find((s) => s.id === activeSection)?.icon && (
                  <sections.find((s) => s.id === activeSection)!.icon className="h-5 w-5" />
                )}
                {sections.find((s) => s.id === activeSection)?.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {sections.find((s) => s.id === activeSection)?.content}
            </CardContent>
          </Card>

          {/* Download Files Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Tài liệu hướng dẫn
              </CardTitle>
              <CardDescription>
                Tải xuống các tài liệu hướng dẫn chi tiết
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {guideFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-md">
                      <FileText className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium">{file.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {file.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{file.type}</Badge>
                    <span className="text-sm text-muted-foreground">
                      {file.size}
                    </span>
                    <Button size="sm" variant="outline">
                      <Download className="h-3 w-3 mr-1" />
                      Tải
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* About Us Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Thông tin liên hệ
              </CardTitle>
              <CardDescription>
                Thông tin về nhà phát triển và hỗ trợ kỹ thuật
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border">
                <div className="space-y-4">
                  <div className="text-center">
                    <h3 className="text-xl font-bold text-gray-800">
                      Hệ thống Quản lý Văn bản Điện tử
                    </h3>
                    <p className="text-gray-600">
                      Phiên bản 1.0 - Phát triển năm 2024
                    </p>
                  </div>
                  
                  <Separator />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Nhà phát triển
                      </h4>
                      <div className="space-y-2 text-sm">
                        <p className="flex items-center gap-2">
                          <span className="font-medium">Họ tên:</span>
                          <span className="text-blue-600 font-semibold">Phạm Bá Nam</span>
                        </p>
                        <p className="flex items-center gap-2">
                          <MapPin className="h-3 w-3" />
                          <span className="font-medium">Đơn vị:</span>
                          <span>Phòng 7</span>
                        </p>
                        <p className="flex items-center gap-2">
                          <Phone className="h-3 w-3" />
                          <span className="font-medium">Liên hệ:</span>
                          <a 
                            href="tel:0342561409" 
                            className="text-blue-600 hover:underline font-medium"
                          >
                            0342561409
                          </a>
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                        <Settings className="h-4 w-4" />
                        Hỗ trợ kỹ thuật
                      </h4>
                      <div className="space-y-2 text-sm">
                        <p>• Hỗ trợ sử dụng hệ thống</p>
                        <p>• Khắc phục sự cố kỹ thuật</p>
                        <p>• Đào tạo sử dụng</p>
                        <p>• Cập nhật và bảo trì</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-center pt-4 border-t">
                    <p className="text-sm text-gray-600">
                      Cảm ơn bạn đã sử dụng hệ thống!
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 
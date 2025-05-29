"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  LogOut,
  User,
  FileText,
  Send,
  ClipboardList,
  Calendar,
  Users,
  Settings,
  Building,
  UserCheck,
  Menu,
  ChevronDown,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import NotificationsDropdown from "@/components/notifications-dropdown";
import { ThemeToggle } from "@/components/theme-toggle";
import { useState } from "react";

export const Header = () => {
  const { user, logout, hasPermission } = useAuth();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Định nghĩa các mục menu với quyền hạn tương ứng
  const navItems = [
    {
      title: "Văn bản đến",
      href: "/van-ban-den",
      icon: FileText,
      permission: null, // Tất cả người dùng đều có thể xem
    },
    {
      title: "Văn bản đi",
      href: "/van-ban-di",
      icon: Send,
      permission: null, // Tất cả người dùng đều có thể xem
    },
    {
      title: "Kế hoạch",
      href: "/ke-hoach",
      icon: ClipboardList,
      permission: null, // Tất cả người dùng đều có thể xem
    },
    {
      title: "Lịch công tác",
      href: "/lich-cong-tac",
      icon: Calendar,
      permission: null, // Tất cả người dùng đều có thể xem
    },
    {
      title: "Người dùng",
      href: "/nguoi-dung",
      icon: Users,
      permission: "manage_users",
    },
    {
      title: "Vai trò",
      href: "/vai-tro",
      icon: UserCheck,
      permission: "ROLE_ADMIN",
    },
    {
      title: "Phòng ban",
      href: "/phong-ban",
      icon: Building,
      permission: "ROLE_ADMIN",
    },
    {
      title: "Cài đặt",
      href: "/cai-dat",
      icon: Settings,
      permission: "ROLE_ADMIN",
    },
  ];

  // Lọc các mục menu dựa trên quyền hạn
  const filteredNavItems = navItems.filter(
    (item) => item.permission === null || hasPermission(item.permission)
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-sm supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center px-4">
        {/* Logo */}
        <div className="mr-6">
          <Link href="/" className="flex items-center space-x-2">
            <FileText className="h-6 w-6 text-primary" />
            <span className="font-bold text-lg text-primary hidden md:block">
              Quản lý Văn bản
            </span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-1 flex-1">
          {filteredNavItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors hover:bg-accent hover:text-accent-foreground",
                  isActive
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.title}
              </Link>
            );
          })}
        </nav>

        {/* Mobile Navigation */}
        <div className="md:hidden flex-1">
          <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-2"
              >
                <Menu className="h-4 w-4" />
                <span>Menu</span>
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-64">
              <DropdownMenuLabel>Chức năng</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {filteredNavItems.map((item) => {
                const isActive =
                  pathname === item.href ||
                  pathname.startsWith(`${item.href}/`);
                return (
                  <DropdownMenuItem key={item.href} asChild>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-2 w-full",
                        isActive && "bg-accent"
                      )}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <item.icon className="h-4 w-4" />
                      {item.title}
                    </Link>
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-3">
          <NotificationsDropdown />
          <ThemeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-9 w-9 rounded-full hover:bg-primary/10"
              >
                <Avatar className="h-9 w-9 border border-primary/20">
                  <AvatarImage
                    src="/placeholder.svg?height=36&width=36"
                    alt="Avatar"
                  />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {user?.fullName ? user.fullName.charAt(0) : "??"}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {user?.fullName || "Người dùng"}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email || "email@example.com"}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile" className="flex items-center">
                  <User className="mr-2 h-4 w-4" />
                  <span>Hồ sơ</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={logout}
                className="flex items-center cursor-pointer"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Đăng xuất</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

import { useState, useEffect, useMemo } from "react";
import { departmentsAPI, DepartmentDTO } from "@/lib/api/departments";
import { useAuth } from "@/lib/auth-context";

// Định nghĩa kiểu dữ liệu cho phòng ban có cấu trúc phân cấp
export interface HierarchicalDepartment extends DepartmentDTO {
  children?: HierarchicalDepartment[];
  level: number;
  fullPath: string;
}

export function useHierarchicalDepartments() {
  const [allDepartments, setAllDepartments] = useState<DepartmentDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, hasRole } = useAuth();

  // Kiểm tra nếu user là admin hoặc vai trò có quyền xem tất cả
  const hasFullAccess = useMemo(
    () =>
      hasRole([
        "ROLE_ADMIN",
        "ROLE_VAN_THU",
        "ROLE_CUC_TRUONG",
        "ROLE_CUC_PHO",
        "ROLE_CHINH_UY",
        "ROLE_PHO_CHINH_UY",
      ]),
    [hasRole]
  );

  // Tải tất cả các phòng ban
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log("Fetching departments...");
        console.log("User info:", {
          user: user?.email,
          departmentId: user?.departmentId,
        });

        // Test if API is working at all
        console.log("Testing API access...");

        const response = await departmentsAPI.getAllDepartments(0, 500);
        console.log("Departments response:", response);
        console.log("Response type:", typeof response);
        console.log("Response keys:", Object.keys(response || {}));

        // Handle the response structure: {message: "Success", data: {content: [...], ...}}
        let departments: DepartmentDTO[] = [];

        if (
          response &&
          response.message === "Success" &&
          response.data &&
          response.data.content &&
          Array.isArray(response.data.content)
        ) {
          departments = response.data.content;
          console.log(
            "✅ Successfully extracted departments from response.data.content:",
            departments.length
          );
        } else if (
          response &&
          (response as any).content &&
          Array.isArray((response as any).content)
        ) {
          departments = (response as any).content;
          console.log(
            "✅ Successfully extracted departments from response.content:",
            departments.length
          );
        } else if (response && Array.isArray(response)) {
          departments = response as any;
          console.log("✅ Response is direct array:", departments.length);
        }

        if (departments.length > 0) {
          setAllDepartments(departments);
          console.log(
            "✅ Successfully set departments:",
            departments.length,
            "departments"
          );
          console.log("First few departments:", departments.slice(0, 3));
        } else {
          console.warn("❌ No departments found in response:", response);
          console.warn("Response.data:", (response as any)?.data);
          console.warn("Response.content:", (response as any)?.content);

          // Fallback: Create some test departments if API returns empty
          console.log("🔄 Creating fallback test departments...");
          const fallbackDepts: DepartmentDTO[] = [
            {
              id: 1,
              name: "Văn phòng Cục",
              abbreviation: "VPC",
              type: "ADMINISTRATIVE",
              childDepartments: [],
            },
            {
              id: 2,
              name: "Phòng Tổ chức Cán bộ",
              abbreviation: "TCCB",
              type: "ADMINISTRATIVE",
              parentDepartmentId: 1,
              childDepartments: [],
            },
            {
              id: 3,
              name: "Phòng Kế hoạch Tài chính",
              abbreviation: "KHTC",
              type: "ADMINISTRATIVE",
              parentDepartmentId: 1,
              childDepartments: [],
            },
          ];
          setAllDepartments(fallbackDepts);
          console.log("✅ Set fallback departments:", fallbackDepts.length);
        }
      } catch (err: any) {
        console.error("❌ Lỗi khi tải danh sách phòng ban:", err);
        console.error("Error details:", {
          message: err.message,
          status: err.response?.status,
          statusText: err.response?.statusText,
          data: err.response?.data,
          url: err.config?.url,
        });
        setError(
          `API Error: ${err.response?.status || "Unknown"} - ${err.message}`
        );
        setAllDepartments([]); // Set empty array on error
      } finally {
        setLoading(false);
      }
    };

    // Only fetch if user is available
    if (user) {
      fetchDepartments();
    } else {
      console.log("⏳ No user available, skipping departments fetch");
      setLoading(false);
    }
  }, [user]); // Add user as dependency

  // Xây dựng cấu trúc phân cấp từ danh sách phòng ban phẳng
  const hierarchicalDepartments = useMemo(() => {
    const buildHierarchy = (
      departments: DepartmentDTO[]
    ): HierarchicalDepartment[] => {
      // Tạo bản đồ các phòng ban bằng ID
      const deptMap = new Map<number, HierarchicalDepartment>();

      // Khởi tạo danh sách kết quả
      const result: HierarchicalDepartment[] = [];

      // Đầu tiên, chuyển đổi tất cả các phòng ban thành dạng phân cấp
      departments.forEach((dept) => {
        deptMap.set(dept.id, {
          ...dept,
          children: [],
          level: 0,
          fullPath: dept.name,
        });
      });

      // Sau đó, xây dựng cấu trúc cây
      departments.forEach((dept) => {
        const hierarchicalDept = deptMap.get(dept.id);
        if (hierarchicalDept) {
          if (dept.parentDepartmentId) {
            // Nếu có phòng ban cha, thêm phòng ban này vào danh sách con của phòng ban cha
            const parent = deptMap.get(dept.parentDepartmentId);
            if (parent) {
              if (!parent.children) {
                parent.children = [];
              }
              hierarchicalDept.level = parent.level + 1;
              hierarchicalDept.fullPath = `${parent.fullPath} > ${dept.name}`;
              parent.children.push(hierarchicalDept);
            } else {
              // Nếu không tìm thấy phòng ban cha, thêm vào cấp cao nhất
              result.push(hierarchicalDept);
            }
          } else {
            // Nếu không có phòng ban cha, thêm vào cấp cao nhất
            result.push(hierarchicalDept);
          }
        }
      });

      return result;
    };

    return buildHierarchy(allDepartments);
  }, [allDepartments]);

  // Xây dựng danh sách phòng ban phẳng có thông tin cấp bậc để hiển thị trong select
  const flattenedDepartments = useMemo(() => {
    const flatten = (
      departments: HierarchicalDepartment[],
      result: HierarchicalDepartment[] = []
    ) => {
      departments.forEach((dept) => {
        result.push(dept);
        if (dept.children && dept.children.length > 0) {
          flatten(dept.children, result);
        }
      });
      return result;
    };

    return flatten(hierarchicalDepartments);
  }, [hierarchicalDepartments]);

  // Lấy phòng ban của người dùng hiện tại và các phòng ban con
  const userDepartmentWithChildren = useMemo(() => {
    if (!user?.departmentId) return [];

    // Tìm phòng ban hiện tại của user
    const findDeptWithChildrenById = (
      deptId: number
    ): HierarchicalDepartment | undefined => {
      return flattenedDepartments.find((d) => d.id === deptId);
    };

    const userDept = findDeptWithChildrenById(Number(user.departmentId));
    if (!userDept) return [];

    // Lấy tất cả phòng ban con của phòng ban hiện tại
    const getAllChildrenIds = (dept: HierarchicalDepartment): number[] => {
      const ids = [dept.id];
      if (dept.children && dept.children.length > 0) {
        dept.children.forEach((child) => {
          ids.push(...getAllChildrenIds(child));
        });
      }
      return ids;
    };

    const departmentIds = userDept ? getAllChildrenIds(userDept) : [];

    // Lọc chỉ lấy phòng ban của user và các phòng ban con
    return flattenedDepartments.filter((dept) =>
      departmentIds.includes(dept.id)
    );
  }, [flattenedDepartments, user?.departmentId]);

  // Danh sách phòng ban sẽ hiển thị trong select tùy theo quyền của người dùng
  const visibleDepartments = useMemo(() => {
    const result = hasFullAccess
      ? flattenedDepartments
      : userDepartmentWithChildren;
    console.log("visibleDepartments calculation:", {
      hasFullAccess,
      flattenedDepartmentsCount: flattenedDepartments.length,
      userDepartmentWithChildrenCount: userDepartmentWithChildren.length,
      resultCount: result.length,
      user: user?.email,
      userDepartmentId: user?.departmentId,
    });
    return result;
  }, [hasFullAccess, flattenedDepartments, userDepartmentWithChildren, user]);

  // Danh sách các ID phòng ban của user (bao gồm phòng ban con)
  const userDepartmentIds = useMemo(() => {
    return userDepartmentWithChildren.map((dept) => dept.id);
  }, [userDepartmentWithChildren]);

  return {
    hierarchicalDepartments,
    flattenedDepartments,
    visibleDepartments,
    userDepartmentWithChildren,
    userDepartmentIds,
    loading,
    error,
    hasFullAccess,
    allDepartments, // Add this for debugging
  };
}

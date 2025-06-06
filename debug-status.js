// Debug script để test logic phân loại status

const SIMPLIFIED_STATUS_GROUPS = {
  pending: {
    code: "pending",
    displayName: "Đang xử lý",
    statuses: [
      "distributed",
      "dept_assigned", 
      "specialist_processing",
      "specialist_submitted",
      "leader_reviewing",
      "department_reviewing",
    ],
  },
  completed: {
    code: "completed", 
    displayName: "Đã xử lý",
    statuses: [
      "leader_approved",
      "leader_commented",
      "department_approved", 
      "department_commented",
      "published",
      "completed",
      "archived",
    ],
  },
  not_processed: {
    code: "not_processed",
    displayName: "Chưa xử lý",
    statuses: ["draft", "registered", "pending_approval"],
  },
};

const getSimplifiedStatusGroup = (detailedStatus) => {
  for (const [key, group] of Object.entries(SIMPLIFIED_STATUS_GROUPS)) {
    if (group.statuses.includes(detailedStatus)) {
      return { code: group.code, displayName: group.displayName };
    }
  }
  // Default to pending if not found
  return { code: "pending", displayName: "Đang xử lý" };
};

// Test các status có thể có
const testStatuses = [
  "completed",
  "leader_approved", 
  "department_approved",
  "archived",
  "published",
  "pending",
  "processing",
  "draft",
  "registered"
];

console.log("=== DEBUG STATUS CLASSIFICATION ===");
testStatuses.forEach(status => {
  const result = getSimplifiedStatusGroup(status);
  console.log(`Status: "${status}" => Group: "${result.code}" (${result.displayName})`);
}); 
import { Suspense } from "react";
import {
  fetchInternalOutgoingDocuments,
  fetchExternalOutgoingDocuments
} from "@/lib/actions/outgoing-documents.actions";
import { OutgoingDocumentsClient } from "./OutgoingDocumentsClient";
import { Loader2 } from "lucide-react";

/**
 * Server Component for Outgoing Documents List
 * This component renders on the server, fetches data, and passes it to client components
 * Benefits:
 * - Zero JS bundle for data fetching
 * - Faster initial page load
 * - Better SEO
 * - Automatic caching with Next.js
 */

interface OutgoingDocumentsServerListProps {
  searchParams?: Promise<{
    page?: string;
    size?: string;
    search?: string;
    tab?: "internal" | "external";
    year?: string;
    month?: string;
    departmentId?: string;
    status?: string;
  }> | {
    page?: string;
    size?: string;
    search?: string;
    tab?: "internal" | "external";
    year?: string;
    month?: string;
    departmentId?: string;
    status?: string;
  };
}

// Loading fallback component
function DocumentsListSkeleton() {
  return (
    <div className="flex h-40 items-center justify-center border rounded-md">
      <div className="flex flex-col items-center text-center py-4">
        <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" />
        <p className="mt-2 text-xs text-muted-foreground">Đang tải danh sách...</p>
      </div>
    </div>
  );
}

/**
 * Main server component
 * This runs on the server and fetches data using Server Actions
 */
export async function OutgoingDocumentsServerList({
  searchParams = {},
}: OutgoingDocumentsServerListProps) {
  // Await searchParams as required by Next.js 15
  const params = await Promise.resolve(searchParams);

  const {
    page = "0",
    size = "10",
    search = "",
    tab = "internal",
    year,
    month,
    departmentId,
    status,
  } = params;

  // Parse parameters
  const pageNum = parseInt(page, 10);
  const sizeNum = parseInt(size, 10);
  const yearNum = year ? parseInt(year, 10) : undefined;
  const monthNum = month ? parseInt(month, 10) : undefined;
  const deptId = departmentId ? parseInt(departmentId, 10) : undefined;

  // Fetch data based on active tab
  // This runs on the server and is automatically cached by Next.js
  const documentsData = tab === "internal"
    ? await fetchInternalOutgoingDocuments({
        page: pageNum,
        size: sizeNum,
        search: search || undefined,
        year: yearNum,
        month: monthNum,
      })
    : await fetchExternalOutgoingDocuments({
        page: pageNum,
        size: sizeNum,
        search: search || undefined,
        departmentId: deptId,
      });

  // Pass server-fetched data to client component
  // Client component handles interactivity (tabs, filters, pagination)
  return (
    <OutgoingDocumentsClient
      initialData={documentsData}
      initialPage={pageNum}
      initialSize={sizeNum}
      initialSearch={search}
      initialTab={tab}
      initialYear={yearNum}
      initialMonth={monthNum}
      initialDepartmentId={deptId}
    />
  );
}

/**
 * Wrapped version with Suspense for streaming
 * This allows the page to render immediately while data loads
 */
export function OutgoingDocumentsWithSuspense(
  props: OutgoingDocumentsServerListProps
) {
  return (
    <Suspense fallback={<DocumentsListSkeleton />}>
      <OutgoingDocumentsServerList {...props} />
    </Suspense>
  );
}

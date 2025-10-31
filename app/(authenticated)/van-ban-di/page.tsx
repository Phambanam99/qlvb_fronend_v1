import { OutgoingDocumentsWithSuspense } from "./_components/OutgoingDocumentsServerList";

/**
 * Outgoing Documents Page (Server Component)
 *
 * This is a Server Component that uses the new architecture:
 * - Server Component (this page) -> fetches data via Server Actions
 * - Client Component -> handles user interactions
 *
 * Benefits:
 * - Zero JS for data fetching
 * - Better performance and SEO
 * - Automatic caching with Next.js
 * - Streaming with Suspense
 */

interface OutgoingDocumentsPageProps {
  searchParams?: {
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

export default function OutgoingDocumentsPage({
  searchParams = {},
}: OutgoingDocumentsPageProps) {
  return (
    <div className="container mx-auto py-6">
      <OutgoingDocumentsWithSuspense searchParams={searchParams} />
    </div>
  );
}

// Enable dynamic rendering for this page
export const dynamic = 'force-dynamic';

"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { cookies } from "next/headers";

/**
 * Server Actions for Outgoing Documents
 * These actions run on the server and can be called from Client Components
 * They provide better performance and security than client-side API calls
 */

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8080";
const API_BASE = `${BACKEND_URL}/api`;

/**
 * Get auth token from cookies
 */
async function getAuthToken() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth-token");
  return token?.value;
}

/**
 * Fetch internal outgoing documents (văn bản đi nội bộ)
 */
export async function fetchInternalOutgoingDocuments(params: {
  page?: number;
  size?: number;
  search?: string;
  year?: number;
  month?: number;
}) {
  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error("Unauthorized");
    }

    const { page = 0, size = 10, search, year, month } = params;

    let endpoint = `${API_BASE}/internal-documents/sent`;
    const queryParams = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });

    // Use year-specific endpoint if year is provided
    if (year) {
      endpoint = `${API_BASE}/internal-documents/sent/by-year/${year}`;
      if (month !== undefined && month !== null) {
        queryParams.set("month", month.toString());
      }
    }

    // TODO: Add search support if needed
    // if (search) {
    //   queryParams.set("search", search);
    // }

    const response = await fetch(
      `${endpoint}?${queryParams}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/hal+json",
        },
        next: {
          revalidate: 30, // Revalidate every 30 seconds
          tags: ["outgoing-internal-documents"],
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch internal outgoing documents: ${response.statusText}`);
    }

    const data = await response.json();
    console.log("Fetched internal outgoing documents data:", data);
    return {
      success: true,
      content: data.data?.content || [],
      totalPages: data.data?.totalPages || 0,
      totalElements: data.data?.totalElements || 0,
    };
  } catch (error: any) {
    console.error("Error fetching internal outgoing documents:", error);
    return {
      success: false,
      error: error.message,
      content: [],
      totalPages: 0,
      totalElements: 0,
    };
  }
}

/**
 * Fetch external outgoing documents (văn bản đi bên ngoài)
 */
export async function fetchExternalOutgoingDocuments(params: {
  page?: number;
  size?: number;
  search?: string;
  departmentId?: number;
}) {
  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error("Unauthorized");
    }

    const { page = 0, size = 10, search, departmentId } = params;

    const queryParams = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });

    // TODO: Add search and departmentId support if backend supports it
    // if (search) {
    //   queryParams.set("search", search);
    // }
    // if (departmentId) {
    //   queryParams.set("departmentId", departmentId.toString());
    // }

    const response = await fetch(
      `${API_BASE}/documents/outgoing?${queryParams}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/hal+json",
        },
        next: {
          revalidate: 60, // Revalidate every 60 seconds
          tags: ["outgoing-external-documents"],
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch external outgoing documents: ${response.statusText}`);
    }

    const data = await response.json();

    // Map to frontend format similar to what the API does
    const content = (data.data?.content || []).map((doc: any) => ({
      ...doc,
      number: doc.documentNumber?.toString() || "",
      recipient: doc.receivingDepartmentText || "N/A",
      sentDate: doc.signingDate,
      departmentId: doc.draftingDepartment,
    }));

    return {
      success: true,
      content,
      totalPages: data.data?.totalPages || 1,
      totalElements: data.data?.totalElements || content.length,
    };
  } catch (error: any) {
    console.error("Error fetching external outgoing documents:", error);
    return {
      success: false,
      error: error.message,
      content: [],
      totalPages: 0,
      totalElements: 0,
    };
  }
}

/**
 * Get outgoing document by ID with caching
 */
export async function getOutgoingDocumentById(id: number) {
  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error("Unauthorized");
    }

    const response = await fetch(
      `${API_BASE}/documents/outgoing/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/hal+json",
        },
        next: {
          revalidate: 300, // 5 minutes - document details don't change often
          tags: [`outgoing-document-${id}`],
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch document: ${response.statusText}`);
    }

    const data = await response.json();

    return {
      success: true,
      data: data,
    };
  } catch (error: any) {
    console.error(`Error fetching outgoing document ${id}:`, error);
    return {
      success: false,
      error: error.message,
      data: null,
    };
  }
}

/**
 * Mark outgoing document as read - mutation action
 */
export async function markOutgoingDocumentAsRead(documentId: number, documentType: string) {
  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error("Unauthorized");
    }

    const response = await fetch(
      `${API_BASE}/documents/${documentId}/mark-read`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/hal+json",
        },
        body: JSON.stringify({ documentType }),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to mark as read: ${response.statusText}`);
    }

    // Revalidate relevant paths and tags
    revalidateTag("outgoing-internal-documents");
    revalidateTag("outgoing-external-documents");
    revalidateTag(`outgoing-document-${documentId}`);
    revalidatePath("/van-ban-di");

    return {
      success: true,
    };
  } catch (error: any) {
    console.error(`Error marking outgoing document ${documentId} as read:`, error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Create new outgoing document - mutation action
 */
export async function createOutgoingDocument(data: any) {
  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error("Unauthorized");
    }

    const response = await fetch(
      `${API_BASE}/documents/outgoing`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/hal+json",
        },
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to create document: ${response.statusText}`);
    }

    const result = await response.json();

    // Revalidate document lists
    revalidateTag("outgoing-internal-documents");
    revalidateTag("outgoing-external-documents");
    revalidatePath("/van-ban-di");

    return {
      success: true,
      data: result,
    };
  } catch (error: any) {
    console.error("Error creating outgoing document:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Update outgoing document - mutation action
 */
export async function updateOutgoingDocument(documentId: number, data: any) {
  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error("Unauthorized");
    }

    const response = await fetch(
      `${API_BASE}/documents/outgoing/${documentId}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/hal+json",
        },
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to update document: ${response.statusText}`);
    }

    const result = await response.json();

    // Revalidate all document-related caches
    revalidateTag("outgoing-internal-documents");
    revalidateTag("outgoing-external-documents");
    revalidateTag(`outgoing-document-${documentId}`);
    revalidatePath("/van-ban-di");

    return {
      success: true,
      data: result,
    };
  } catch (error: any) {
    console.error(`Error updating outgoing document ${documentId}:`, error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Delete outgoing document - mutation action
 */
export async function deleteOutgoingDocument(documentId: number) {
  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error("Unauthorized");
    }

    const response = await fetch(
      `${API_BASE}/documents/outgoing/${documentId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/hal+json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to delete document: ${response.statusText}`);
    }

    // Revalidate all document caches
    revalidateTag("outgoing-internal-documents");
    revalidateTag("outgoing-external-documents");
    revalidateTag(`outgoing-document-${documentId}`);
    revalidatePath("/van-ban-di");

    return {
      success: true,
    };
  } catch (error: any) {
    console.error(`Error deleting outgoing document ${documentId}:`, error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Revalidate outgoing documents cache manually
 */
export async function revalidateOutgoingDocuments() {
  revalidateTag("outgoing-internal-documents");
  revalidateTag("outgoing-external-documents");
  revalidatePath("/van-ban-di");

  return { success: true };
}

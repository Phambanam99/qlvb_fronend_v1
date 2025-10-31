"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { cookies } from "next/headers";

/**
 * Server Actions for Incoming Documents
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
 * Fetch incoming documents with server-side caching
 * @param params Query parameters
 */
export async function fetchIncomingDocuments(params: {
  page?: number;
  size?: number;
  search?: string;
  year?: number;
  month?: number;
  departmentId?: number;
}) {
  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error("Unauthorized");
    }

    const { page = 0, size = 10, search, year, month, departmentId } = params;

    const queryParams = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
      ...(search && { search }),
      ...(year && { year: year.toString() }),
      ...(month && { month: month.toString() }),
      ...(departmentId && { departmentId: departmentId.toString() }),
    });

    const response = await fetch(
      `${API_BASE}/documents/incoming?${queryParams}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/hal+json",
        },
        // Cache với revalidation
        next: {
          revalidate: 60, // Revalidate every 60 seconds
          tags: ["incoming-documents"], // Tag for on-demand revalidation
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch documents: ${response.statusText}`);
    }

    const data = await response.json();

    return {
      success: true,
      content: data.data?.content || [],
      totalPages: data.data?.totalPages || 0,
      totalElements: data.data?.totalElements || 0,
    };
  } catch (error: any) {
    console.error("Error fetching incoming documents:", error);
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
 * Fetch internal documents (nội bộ)
 */
export async function fetchInternalDocuments(params: {
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

    let endpoint = `${API_BASE}/internal-documents/received`;
    const queryParams = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });

    // Use year-specific endpoint if year is provided
    if (year) {
      endpoint = `${API_BASE}/internal-documents/received/by-year/${year}`;
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
          revalidate: 30, // More frequent revalidation for internal docs
          tags: ["internal-documents"],
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch internal documents: ${response.statusText}`);
    }

    const data = await response.json();

    return {
      success: true,
      content: data.data?.content || [],
      totalPages: data.data?.totalPages || 0,
      totalElements: data.data?.totalElements || 0,
    };
  } catch (error: any) {
    console.error("Error fetching internal documents:", error);
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
 * Fetch external documents (bên ngoài)
 */
export async function fetchExternalDocuments(params: {
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
      `${API_BASE}/documents/incoming?${queryParams}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/hal+json",
        },
        next: {
          revalidate: 60,
          tags: ["external-documents"],
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch external documents: ${response.statusText}`);
    }

    const data = await response.json();

    // Handle both response formats: {data: {content: []}} or {content: []}
    const content = data.data?.content || data.content || [];
    const totalPages = data.data?.totalPages || data.page?.totalPages || 0;
    const totalElements = data.data?.totalElements || data.page?.totalElements || 0;

    return {
      success: true,
      content,
      totalPages,
      totalElements,
    };
  } catch (error: any) {
    console.error("Error fetching external documents:", error);
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
 * Get document by ID with caching
 */
export async function getDocumentById(id: number) {
  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error("Unauthorized");
    }

    const response = await fetch(
      `${API_BASE}/documents/incoming/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/hal+json",
        },
        next: {
          revalidate: 300, // 5 minutes - document details don't change often
          tags: [`document-${id}`],
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
    console.error(`Error fetching document ${id}:`, error);
    return {
      success: false,
      error: error.message,
      data: null,
    };
  }
}

/**
 * Mark document as read - mutation action
 */
export async function markDocumentAsRead(documentId: number, documentType: string) {
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
    revalidateTag("incoming-documents");
    revalidateTag(`document-${documentId}`);
    revalidatePath("/van-ban-den");

    return {
      success: true,
    };
  } catch (error: any) {
    console.error(`Error marking document ${documentId} as read:`, error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Update document - mutation action
 */
export async function updateDocument(documentId: number, data: any) {
  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error("Unauthorized");
    }

    const response = await fetch(
      `${API_BASE}/documents/incoming/${documentId}`,
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
    revalidateTag("incoming-documents");
    revalidateTag("internal-documents");
    revalidateTag("external-documents");
    revalidateTag(`document-${documentId}`);
    revalidatePath("/van-ban-den");

    return {
      success: true,
      data: result,
    };
  } catch (error: any) {
    console.error(`Error updating document ${documentId}:`, error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Create new document - mutation action
 */
export async function createDocument(data: any) {
  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error("Unauthorized");
    }

    const response = await fetch(
      `${API_BASE}/documents/incoming`,
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
    revalidateTag("incoming-documents");
    revalidateTag("internal-documents");
    revalidateTag("external-documents");
    revalidatePath("/van-ban-den");

    return {
      success: true,
      data: result,
    };
  } catch (error: any) {
    console.error("Error creating document:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Delete document - mutation action
 */
export async function deleteDocument(documentId: number) {
  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error("Unauthorized");
    }

    const response = await fetch(
      `${API_BASE}/documents/incoming/${documentId}`,
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
    revalidateTag("incoming-documents");
    revalidateTag("internal-documents");
    revalidateTag("external-documents");
    revalidateTag(`document-${documentId}`);
    revalidatePath("/van-ban-den");

    return {
      success: true,
    };
  } catch (error: any) {
    console.error(`Error deleting document ${documentId}:`, error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Revalidate documents cache manually
 */
export async function revalidateDocuments() {
  revalidateTag("incoming-documents");
  revalidateTag("internal-documents");
  revalidateTag("external-documents");
  revalidatePath("/van-ban-den");

  return { success: true };
}

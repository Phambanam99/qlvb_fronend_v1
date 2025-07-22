/**
 * Simple test to verify backend read status API
 */

import { documentReadStatusAPI } from "@/lib/api/documentReadStatus";

export async function testBackendReadStatus() {
  console.log("=== Testing Backend Read Status API ===");

  try {
    // Test 1: Get batch read status for some document IDs
    console.log("Test 1: Get batch read status");
    const testIds = [1, 2, 3]; // Replace with actual document IDs
    const batchResult = await documentReadStatusAPI.getBatchReadStatus(
      testIds,
      "INCOMING_EXTERNAL"
    );
    console.log("Batch result:", batchResult);

    // Test 2: Mark first document as read
    if (testIds.length > 0) {
      console.log("Test 2: Mark document as read");
      await documentReadStatusAPI.markAsRead(testIds[0], "INCOMING_EXTERNAL");
      console.log("Document marked as read successfully");

      // Test 3: Check if it's really marked as read
      console.log("Test 3: Check single document read status");
      const singleResult = await documentReadStatusAPI.isDocumentRead(
        testIds[0],
        "INCOMING_EXTERNAL"
      );
      console.log("Single result:", singleResult);
    }
  } catch (error) {
    console.error("Test failed:", error);
  }
}

// Call this function in browser console to test
// testBackendReadStatus();

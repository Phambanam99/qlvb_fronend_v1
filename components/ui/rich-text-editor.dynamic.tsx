"use client";
// Lightweight wrapper that dynamically loads the heavy Tiptap editor only on client when actually rendered.
import dynamic from "next/dynamic";
import React from "react";

const LazyEditor = dynamic(() => import("./rich-text-editor"), {
  ssr: false,
  loading: () => (
    <div className="border rounded-md p-3 text-xs text-muted-foreground">
      Đang tải trình soạn thảo...
    </div>
  ),
});

export const RichTextEditorDynamic = LazyEditor;
export default RichTextEditorDynamic;

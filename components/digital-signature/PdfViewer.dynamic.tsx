"use client";
import dynamic from "next/dynamic";
import React from "react";

const LazyPdfViewer = dynamic(() => import("./PdfViewer").then(m => m.PdfViewer), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-64 border rounded-md text-xs text-muted-foreground">
      Đang tải trình xem PDF...
    </div>
  )
});

export const PdfViewerDynamic = LazyPdfViewer;
export default PdfViewerDynamic;

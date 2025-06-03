import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

interface WatermarkOptions {
  text: string;
  opacity?: number;
  fontSize?: number;
  color?: [number, number, number];
  angle?: number; // Góc xoay theo độ
}

/**
 * Thêm watermark vào file PDF
 * @param pdfData - Blob, ArrayBuffer hoặc Uint8Array của file PDF gốc
 * @param options - Tùy chọn watermark
 * @returns Bytes của file PDF đã có watermark
 */
export async function addWatermarkToPdf(
  pdfData: Blob | ArrayBuffer | Uint8Array,
  options: WatermarkOptions
): Promise<Uint8Array> {
  try {
    let pdfBytes: ArrayBuffer;

    // Convert input data to ArrayBuffer
    if (pdfData instanceof Blob) {
      pdfBytes = await pdfData.arrayBuffer();
    } else if (pdfData instanceof Uint8Array) {
      pdfBytes = pdfData.buffer.slice(
        pdfData.byteOffset,
        pdfData.byteOffset + pdfData.byteLength
      );
    } else if (pdfData instanceof ArrayBuffer) {
      pdfBytes = pdfData;
    } else {
      throw new Error(
        "Invalid PDF data format. Expected Blob, ArrayBuffer, or Uint8Array"
      );
    }

    // Load PDF document
    const pdfDoc = await PDFDocument.load(pdfBytes);

    // Get all pages
    const pages = pdfDoc.getPages();

    // Load font
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // Default options
    const {
      text,
      opacity = 0.3,
      fontSize = 50,
      color = [0.7, 0.7, 0.7], // Light gray
      angle = -45, // Diagonal angle
    } = options;

    // Add watermark to each page
    for (const page of pages) {
      const { width, height } = page.getSize();

      // Calculate text dimensions
      const textWidth = font.widthOfTextAtSize(text, fontSize);
      const textHeight = fontSize;

      // Position watermark in center
      const x = (width - textWidth) / 2;
      const y = (height - textHeight) / 2;

      // Add watermark text
      page.drawText(text, {
        x,
        y,
        size: fontSize,
        font,
        color: rgb(color[0], color[1], color[2]),
        opacity,
        rotate: {
          type: "degrees",
          angle: angle,
        },
      });

      // Add additional watermarks for better coverage (optional)
      const spacing = 200;
      for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
          if (i === 0 && j === 0) continue; // Skip center (already added)

          const offsetX = x + i * spacing;
          const offsetY = y + j * spacing;

          // Only add if within page bounds
          if (
            offsetX > 0 &&
            offsetX < width &&
            offsetY > 0 &&
            offsetY < height
          ) {
            page.drawText(text, {
              x: offsetX,
              y: offsetY,
              size: fontSize * 0.8,
              font,
              color: rgb(color[0], color[1], color[2]),
              opacity: opacity * 0.6,
              rotate: {
                type: "degrees",
                angle: angle,
              },
            });
          }
        }
      }
    }

    // Return modified PDF bytes
    return await pdfDoc.save();
  } catch (error) {
    console.error("Error adding watermark to PDF:", error);
    throw new Error(
      `Failed to add watermark to PDF: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

/**
 * Tạo watermark với tên người dùng
 * @param userFullName - Tên đầy đủ của người dùng
 * @param pdfData - Blob, ArrayBuffer hoặc Uint8Array của file PDF gốc
 * @returns Bytes của file PDF đã có watermark
 */
export async function addUserWatermarkToPdf(
  userFullName: string,
  pdfData: Blob | ArrayBuffer | Uint8Array
): Promise<Uint8Array> {
  const watermarkText = `Downloaded by: ${userFullName}`;

  return addWatermarkToPdf(pdfData, {
    text: watermarkText,
    opacity: 0.25,
    fontSize: 36,
    color: [0.6, 0.6, 0.6],
    angle: -45,
  });
}

/**
 * Download file PDF với watermark
 * @param pdfData - Blob, ArrayBuffer hoặc Uint8Array của file PDF gốc
 * @param fileName - Tên file để download
 * @param userFullName - Tên đầy đủ của người dùng
 */
export async function downloadPdfWithWatermark(
  pdfData: Blob | ArrayBuffer | Uint8Array,
  fileName: string,
  userFullName: string
): Promise<void> {
  try {
    // Add watermark
    const watermarkedPdf = await addUserWatermarkToPdf(userFullName, pdfData);

    // Create blob and download
    const blob = new Blob([watermarkedPdf], { type: "application/pdf" });
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error downloading PDF with watermark:", error);
    throw error;
  }
}

/**
 * Kiểm tra xem file có phải là PDF không
 * @param fileName - Tên file
 * @param contentType - Content type của file
 * @returns true nếu là PDF
 */
export function isPdfFile(fileName: string, contentType?: string): boolean {
  const pdfExtensions = [".pdf"];
  const pdfMimeTypes = ["application/pdf"];

  const hasValidExtension = pdfExtensions.some((ext) =>
    fileName.toLowerCase().endsWith(ext)
  );

  const hasValidMimeType = contentType
    ? pdfMimeTypes.includes(contentType.toLowerCase())
    : false;

  return hasValidExtension || hasValidMimeType;
}

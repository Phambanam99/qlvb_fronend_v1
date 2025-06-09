import { PDFDocument, rgb, StandardFonts, degrees } from "pdf-lib";

/**
 * Sanitize text to remove Vietnamese characters that WinAnsi encoding can't handle
 * @param text - Original text with Vietnamese characters
 * @returns Sanitized text compatible with WinAnsi encoding
 */
function sanitizeTextForWatermark(text: string): string {
  // Map Vietnamese characters to ASCII equivalents
  const vietnameseMap: { [key: string]: string } = {
    à: "a",
    á: "a",
    ạ: "a",
    ả: "a",
    ã: "a",
    â: "a",
    ầ: "a",
    ấ: "a",
    ậ: "a",
    ẩ: "a",
    ẫ: "a",
    ă: "a",
    ằ: "a",
    ắ: "a",
    ặ: "a",
    ẳ: "a",
    ẵ: "a",
    è: "e",
    é: "e",
    ẹ: "e",
    ẻ: "e",
    ẽ: "e",
    ê: "e",
    ề: "e",
    ế: "e",
    ệ: "e",
    ể: "e",
    ễ: "e",
    ì: "i",
    í: "i",
    ị: "i",
    ỉ: "i",
    ĩ: "i",
    ò: "o",
    ó: "o",
    ọ: "o",
    ỏ: "o",
    õ: "o",
    ô: "o",
    ồ: "o",
    ố: "o",
    ộ: "o",
    ổ: "o",
    ỗ: "o",
    ơ: "o",
    ờ: "o",
    ớ: "o",
    ợ: "o",
    ở: "o",
    ỡ: "o",
    ù: "u",
    ú: "u",
    ụ: "u",
    ủ: "u",
    ũ: "u",
    ư: "u",
    ừ: "u",
    ứ: "u",
    ự: "u",
    ử: "u",
    ữ: "u",
    ỳ: "y",
    ý: "y",
    ỵ: "y",
    ỷ: "y",
    ỹ: "y",
    đ: "d",
    // Uppercase versions
    À: "A",
    Á: "A",
    Ạ: "A",
    Ả: "A",
    Ã: "A",
    Â: "A",
    Ầ: "A",
    Ấ: "A",
    Ậ: "A",
    Ẩ: "A",
    Ẫ: "A",
    Ă: "A",
    Ằ: "A",
    Ắ: "A",
    Ặ: "A",
    Ẳ: "A",
    Ẵ: "A",
    È: "E",
    É: "E",
    Ẹ: "E",
    Ẻ: "E",
    Ẽ: "E",
    Ê: "E",
    Ề: "E",
    Ế: "E",
    Ệ: "E",
    Ể: "E",
    Ễ: "E",
    Ì: "I",
    Í: "I",
    Ị: "I",
    Ỉ: "I",
    Ĩ: "I",
    Ò: "O",
    Ó: "O",
    Ọ: "O",
    Ỏ: "O",
    Õ: "O",
    Ô: "O",
    Ồ: "O",
    Ố: "O",
    Ộ: "O",
    Ổ: "O",
    Ỗ: "O",
    Ơ: "O",
    Ờ: "O",
    Ớ: "O",
    Ợ: "O",
    Ở: "O",
    Ỡ: "O",
    Ù: "U",
    Ú: "U",
    Ụ: "U",
    Ủ: "U",
    Ũ: "U",
    Ư: "U",
    Ừ: "U",
    Ứ: "U",
    Ự: "U",
    Ử: "U",
    Ữ: "U",
    Ỳ: "Y",
    Ý: "Y",
    Ỵ: "Y",
    Ỷ: "Y",
    Ỹ: "Y",
    Đ: "D",
  };

  // Replace Vietnamese characters with ASCII equivalents
  return text.replace(/[^\x00-\x7F]/g, (char) => {
    return vietnameseMap[char] || char;
  });
}

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
      ) as ArrayBuffer;
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
      text: originalText,
      opacity = 0.3,
      fontSize = 50,
      color = [0.7, 0.7, 0.7], // Light gray
      angle = -45, // Diagonal angle
    } = options;

    // Sanitize text to remove Vietnamese characters that WinAnsi can't encode
    const text = sanitizeTextForWatermark(originalText);

    // Add watermark to each page
    for (const page of pages) {
      const { width, height } = page.getSize();

      // Calculate text dimensions with error handling
      let textWidth: number;
      try {
        textWidth = font.widthOfTextAtSize(text, fontSize);
      } catch (encodingError) {
        console.warn(
          "Font encoding error, using fallback width calculation:",
          encodingError
        );
        // Fallback: estimate width based on character count
        textWidth = text.length * fontSize * 0.6;
      }
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
        rotate: degrees(angle),
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
              rotate: degrees(angle),
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
  const watermarkText = `${userFullName}`;

  return addWatermarkToPdf(pdfData, {
    text: watermarkText,
    opacity: 0.25,
    fontSize: 56,
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

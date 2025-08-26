import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const backend = process.env.BACKEND_URL || "http://localhost:8080";
    const url = `${backend}/api/auth/login`;
    const body = await req.text();

    // Forward without cookies; set explicit headers
    const resp = await fetch(url, {
      method: "POST",
      // Don't forward incoming cookies to avoid backend JWT filters interfering
      headers: {
        "Content-Type": "application/json",
        Accept: "application/hal+json",
      },
      body,
      // credentials not used in Node fetch; cookies are only what we set in headers (none)
    });

    const text = await resp.text();
    const contentType = resp.headers.get("content-type") || "application/json";

    return new NextResponse(text, {
      status: resp.status,
      headers: {
        "content-type": contentType,
      },
    });
  } catch (e: any) {
    return NextResponse.json(
      { message: "Proxy login failed", error: e?.message || "unknown" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";

function getFilenameFromUrl(url: string): string {
  try {
    const parsedUrl = new URL(url);
    const pathname = parsedUrl.pathname;
    return pathname.substring(pathname.lastIndexOf("/") + 1) || "download";
  } catch {
    return "download";
  }
}

export async function GET(request: NextRequest): Promise<Response> {
  const fileKey = request.nextUrl.searchParams.get("file");
  if (!fileKey) {
    return NextResponse.json({ error: "Missing 'file' query parameter." }, { status: 400 });
  }

  try {
    const fileDocRef = doc(db, "download_links", fileKey);
    const fileDocSnap = await getDoc(fileDocRef);

    if (!fileDocSnap.exists()) {
      return NextResponse.json({ error: `No download found for key: '${fileKey}'` }, { status: 404 });
    }

    const data = fileDocSnap.data();
    const downloadUrl = data?.link;

    if (!downloadUrl) {
      return NextResponse.json({ error: "Invalid download data, missing link." }, { status: 500 });
    }

    const filename = data?.filename || getFilenameFromUrl(downloadUrl);

    const fetchResponse = await fetch(downloadUrl);
    if (!fetchResponse.ok || !fetchResponse.body) {
      console.error(`[DOWNLOAD ERROR] Failed to fetch ${fileKey}:`, fetchResponse.statusText);
      return NextResponse.json({ error: "Failed to fetch the requested file." }, { status: 502 });
    }

    return new Response(fetchResponse.body, {
      headers: {
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Type": "application/octet-stream",
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error(`[SERVER ERROR] Exception while downloading '${fileKey}':`, error);
    return NextResponse.json({ error: "Internal server error while processing your request." }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { verifyToken } from "@/lib/utils/verifyToken";
import File from "@/models/File";

export async function GET(req: NextRequest) {
  await connectDB();

  const token = req.headers.get("authorization")?.split(" ")[1];
  const userId = verifyToken(token);
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const folderId = searchParams.get("folderId");

  const query: Record<string, unknown> = { userId };

  if (folderId !== null) {
    query.folderId = folderId === "null" ? null : folderId;
  }

  const files = await File.find(query).sort({ uploadedAt: -1 });
  return NextResponse.json(files);
}

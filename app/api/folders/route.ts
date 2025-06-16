import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { verifyToken } from "@/lib/utils/verifyToken";
import Folder from "@/models/Folder";

export async function POST(req: NextRequest) {
  await connectDB();

  const token = req.headers.get("authorization")?.split(" ")[1];
  const userId = verifyToken(token);
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { name, parentId = null } = body;

  if (!name || typeof name !== "string") {
    return NextResponse.json({ error: "Invalid folder name" }, { status: 400 });
  }

  const newFolder = await Folder.create({ name, userId, parentId });

  return NextResponse.json(newFolder, { status: 201 });
}

export async function GET(req: NextRequest) {
  await connectDB();

  const token = req.headers.get("authorization")?.split(" ")[1];
  const userId = verifyToken(token);
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const folders = await Folder.find({ userId });

  return NextResponse.json(folders);
}

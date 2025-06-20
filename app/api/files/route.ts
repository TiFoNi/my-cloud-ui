import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { verifyToken } from "@/lib/utils/verifyToken";
import File from "@/models/File";
import { User } from "@/models/User";

export async function GET(req: NextRequest) {
  await connectDB();

  const token = req.headers.get("authorization")?.split(" ")[1];
  const userId = verifyToken(token);
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const folderId = searchParams.get("folderId");

  const currentUser = await User.findById(userId);
  if (!currentUser?.department) {
    return NextResponse.json([], { status: 200 });
  }

  const usersInDept = await User.find({ department: currentUser.department });
  const userIds = usersInDept.map((u) => u._id);

  const query: {
    userId: { $in: string[] };
    folderId?: string | null;
  } = {
    userId: { $in: userIds },
  };

  if (folderId !== null) {
    query.folderId = folderId === "null" ? null : folderId;
  }

  const files = await File.find(query).sort({ uploadedAt: -1 });
  return NextResponse.json(files);
}

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
  const folderIdRaw = searchParams.get("folderId");
  const folderId = folderIdRaw === "null" ? null : folderIdRaw;

  const currentUser = await User.findById(userId);
  if (!currentUser?.department) {
    const query: { userId: string; folderId?: string | null } = { userId };
    if (folderIdRaw !== null) {
      query.folderId = folderId;
    }

    const ownFiles = await File.find(query).sort({ uploadedAt: -1 });
    return NextResponse.json({ ownFiles, deptFiles: [] });
  }

  const usersInDept = await User.find({ department: currentUser.department });
  const userIds: string[] = usersInDept.map((u) => u._id.toString());

  const queryAll: {
    userId: { $in: string[] };
    folderId?: string | null;
  } = {
    userId: { $in: userIds },
  };

  if (folderIdRaw !== null) {
    queryAll.folderId = folderId;
  }

  const allFiles = await File.find(queryAll).sort({ uploadedAt: -1 });

  const ownFiles = allFiles.filter((file) => file.userId.toString() === userId);
  const deptFiles = allFiles.filter(
    (file) => file.userId.toString() !== userId
  );

  return NextResponse.json({ ownFiles, deptFiles });
}

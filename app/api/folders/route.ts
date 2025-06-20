import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { verifyToken } from "@/lib/utils/verifyToken";
import Folder from "@/models/Folder";
import { User } from "@/models/User";

export async function GET(req: NextRequest) {
  await connectDB();

  const token = req.headers.get("authorization")?.split(" ")[1];
  const userId = verifyToken(token);
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const currentUser = await User.findById(userId);
  if (!currentUser?.department) {
    return NextResponse.json([], { status: 200 });
  }

  const usersInDept = await User.find({ department: currentUser.department });
  const userIds = usersInDept.map((u) => u._id);

  const folders = await Folder.find({ userId: { $in: userIds } });
  return NextResponse.json(folders);
}

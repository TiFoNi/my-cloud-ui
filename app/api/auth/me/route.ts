import { NextRequest, NextResponse } from "next/server";
import jwt, { JwtPayload } from "jsonwebtoken";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";

const JWT_SECRET = process.env.JWT_SECRET!;

export async function GET(req: NextRequest) {
  const token = req.headers.get("authorization")?.split(" ")[1];
  if (!token)
    return NextResponse.json({ error: "Missing token" }, { status: 401 });

  let userId: string;
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    userId = decoded.userId;
  } catch {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  await connectDB();
  const user = await User.findById(userId).populate("department");
  if (!user)
    return NextResponse.json({ error: "User not found" }, { status: 404 });

  return NextResponse.json({
    email: user.email,
    nickname: user.nickname,
    role: user.role,
    department: user.department
      ? {
          _id: user.department._id,
          name: user.department.name,
        }
      : null,
  });
}


export async function PUT(req: NextRequest) {
  const token = req.headers.get("authorization")?.split(" ")[1];
  if (!token)
    return NextResponse.json({ error: "Missing token" }, { status: 401 });

  let userId: string;
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    userId = decoded.userId;
  } catch {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  const { nickname, role } = await req.json();

  await connectDB();
  const user = await User.findById(userId);
  if (!user)
    return NextResponse.json({ error: "User not found" }, { status: 404 });

  if (nickname) user.nickname = nickname;
  if (role) user.role = role;

  await user.save();

  return NextResponse.json({ message: "User updated" });
}

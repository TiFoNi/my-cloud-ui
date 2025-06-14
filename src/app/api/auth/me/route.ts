import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";

// === DB setup ===
const MONGODB_URI = process.env.MONGODB_URI!;
const JWT_SECRET = process.env.JWT_SECRET!;
await mongoose.connect(MONGODB_URI);

const User = mongoose.models.User;

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader)
    return NextResponse.json({ error: "No token" }, { status: 401 });

  const token = authHeader.split(" ")[1];
  let userId = "";

  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);
    userId = decoded.userId;
  } catch {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  const user = await User.findById(userId);
  if (!user)
    return NextResponse.json({ error: "User not found" }, { status: 404 });

  const { email, nickname, role } = user;
  return NextResponse.json({ email, nickname, role });
}

export async function PUT(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader)
    return NextResponse.json({ error: "No token" }, { status: 401 });

  const token = authHeader.split(" ")[1];
  let userId = "";

  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);
    userId = decoded.userId;
  } catch {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  const body = await req.json();
  const user = await User.findById(userId);
  if (!user)
    return NextResponse.json({ error: "User not found" }, { status: 404 });

  if (body.nickname) user.nickname = body.nickname;
  if (body.role) user.role = body.role;

  await user.save();

  return NextResponse.json({ message: "User updated" });
}

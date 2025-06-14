import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";

export async function POST(req: Request) {
  await connectDB();
  const { email, password } = await req.json();

  const existing = await User.findOne({ email });
  if (existing) {
    return NextResponse.json(
      { error: "Email already exists" },
      { status: 409 }
    );
  }

  const hash = await bcrypt.hash(password, 10);
  await User.create({ email, password: hash });

  return NextResponse.json({ message: "User created" });
}

import { NextResponse } from "next/server";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

// === DB setup ===
const MONGODB_URI = process.env.MONGODB_URI!;
await mongoose.connect(MONGODB_URI);

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  nickname: { type: String, default: "NoName" },
  role: { type: String, default: "user" },
});
const User = mongoose.models.User || mongoose.model("User", UserSchema);

export async function POST(req: Request) {
  const { email, password } = await req.json();
  if (!email || !password)
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const existing = await User.findOne({ email });
  if (existing)
    return NextResponse.json(
      { error: "Email already exists" },
      { status: 409 }
    );

  const hash = await bcrypt.hash(password, 10);
  const newUser = await User.create({ email, password: hash });

  return NextResponse.json(
    { message: "User created", userId: newUser._id },
    { status: 201 }
  );
}

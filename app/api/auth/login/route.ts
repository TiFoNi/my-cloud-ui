import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { sendEmail } from "@/lib/email/sendEmail";

const JWT_SECRET = process.env.JWT_SECRET!;
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL!;

export async function POST(req: Request) {
  await connectDB();
  const { email, password } = await req.json();

  const user = await User.findOne({ email });
  if (!user) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const sessionToken = jwt.sign({ userId: user._id }, JWT_SECRET, {
    expiresIn: "15m",
  });

  const verifyLink = `${BASE_URL}/verify-session?token=${sessionToken}`;

  await sendEmail({
    to: "ki211_uiv@student.ztu.edu.ua",
    subject: "Verify your session",
    html: `<p>Click <a href='${verifyLink}'>here</a> to confirm your login session. This link will expire in 15 minutes.</p>`,
  });

  return NextResponse.json({
    status: "pending",
    message: "Verification email sent",
  });
}

import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { sendEmail } from "@/lib/email/sendEmail";

const JWT_SECRET = process.env.JWT_SECRET!;
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL!;

export async function POST(req: Request) {
  await connectDB();
  const { email } = await req.json();

  const user = await User.findOne({ email });
  if (!user)
    return NextResponse.json({ error: "User not found" }, { status: 404 });

  const sessionToken = jwt.sign({ userId: user._id }, JWT_SECRET, {
    expiresIn: "15m",
  });

  const verifyLink = `${BASE_URL}/verify-session?token=${sessionToken}`;

  await sendEmail({
    to: "ki211_uiv@student.ztu.edu.ua",
    subject: "Verify your session",
    html: `<p>Click <a href='${verifyLink}'>here</a> to verify your session.</p>`,
  });

  return NextResponse.json({ message: "Verification email sent" });
}

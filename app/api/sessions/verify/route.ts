import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 400 });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET) as { userId: string };
    const sessionToken = jwt.sign({ userId: payload.userId }, JWT_SECRET, {
      expiresIn: "2h",
    });

    return NextResponse.json({ success: true, token: sessionToken });
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid token" },
      { status: 401 }
    );
  }
}

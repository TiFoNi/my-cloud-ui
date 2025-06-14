import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { JwtPayload } from "jsonwebtoken";

const MONGODB_URI = process.env.MONGODB_URI!;
await mongoose.connect(MONGODB_URI);

const FileSchema = new mongoose.Schema({
  userId: String,
  filename: String,
  s3Key: String,
  url: String,
  uploadedAt: { type: Date, default: Date.now },
});

const FileModel = mongoose.models.File || mongoose.model("File", FileSchema);

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader) {
    return NextResponse.json({ error: "Missing token" }, { status: 401 });
  }

  const token = authHeader.split(" ")[1];
  let userId: string;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    userId = decoded.userId as string;
  } catch {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  try {
    const files = await FileModel.find({ userId }).sort({ uploadedAt: -1 });
    return NextResponse.json(files);
  } catch {
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}

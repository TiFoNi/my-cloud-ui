import { NextRequest, NextResponse } from "next/server";
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";
import jwt, { JwtPayload } from "jsonwebtoken";
import mongoose from "mongoose";

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

const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function DELETE(req: NextRequest) {
  const token = req.headers.get("authorization")?.split(" ")[1];
  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 401 });
  }

  let userId: string;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    if (!decoded.userId || typeof decoded.userId !== "string") {
      throw new Error("Invalid token payload");
    }
    userId = decoded.userId;
  } catch {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  const body = await req.json();
  const fileId: string = body.fileId;

  const file = await FileModel.findOne({ _id: fileId, userId });
  if (!file) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  await s3.send(
    new DeleteObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME!,
      Key: file.s3Key,
    })
  );

  await FileModel.deleteOne({ _id: fileId });

  return NextResponse.json({ message: "File deleted" });
}

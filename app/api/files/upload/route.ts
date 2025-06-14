import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
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

export async function POST(req: NextRequest) {
  const token = req.headers.get("authorization")?.split(" ")[1];
  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 401 });
  }

  let userId: string;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string;
    };
    userId = decoded.userId;
  } catch {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File;

  if (!file) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const s3Key = `${userId}/${Date.now()}-${file.name}`;

  try {
    await s3.send(
      new PutObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME!,
        Key: s3Key,
        Body: buffer,
      })
    );

    const url = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Key}`;

    await FileModel.create({
      userId,
      filename: file.name,
      s3Key,
      url,
    });

    return NextResponse.json({ message: "File uploaded", url });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}

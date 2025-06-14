import type { NextApiRequest, NextApiResponse } from "next";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import formidable from "formidable";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

export const config = {
  api: {
    bodyParser: false,
  },
};

// === MongoDB Setup ===
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

// === S3 Setup ===
const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") return res.status(405).end("Method Not Allowed");

  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Missing token" });

  let userId: string;
  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    userId = decoded.userId;
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }

  const form = formidable({});
  const [fields, files] = await form.parse(req);

  const file = Array.isArray(files.file) ? files.file[0] : files.file;

  // === Перевірка, щоб уникнути TypeScript errors
  if (
    !file ||
    typeof file.filepath !== "string" ||
    typeof file.originalFilename !== "string"
  ) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const fileStream = fs.createReadStream(file.filepath);
  const key = `uploads/${uuidv4()}-${file.originalFilename}`;

  const uploadParams = {
    Bucket: process.env.AWS_BUCKET_NAME!,
    Key: key,
    Body: fileStream,
    ContentType: file.mimetype || "application/octet-stream",
  };

  await s3.send(new PutObjectCommand(uploadParams));

  const fileUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

  await FileModel.create({
    userId,
    filename: file.originalFilename,
    s3Key: key,
    url: fileUrl,
  });

  res.status(200).json({ url: fileUrl });
}

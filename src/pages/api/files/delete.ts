import type { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";

const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const MONGODB_URI = process.env.MONGODB_URI!;
await mongoose.connect(MONGODB_URI);

const FileModel = mongoose.models.File;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "DELETE") return res.status(405).end();

  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Missing token" });

  let userId: string;
  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    userId = decoded.userId;
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }

  const { fileId } = req.body;
  const file = await FileModel.findOne({ _id: fileId, userId });
  if (!file) return res.status(404).json({ error: "File not found" });

  await s3.send(
    new DeleteObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME!,
      Key: file.s3Key,
    })
  );

  await FileModel.deleteOne({ _id: fileId });

  res.status(200).json({ message: "File deleted" });
}

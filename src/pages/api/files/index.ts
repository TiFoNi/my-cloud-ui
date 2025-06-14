import type { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";
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

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") return res.status(405).end("Method Not Allowed");

  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Missing token" });

  let userId: string;
  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    userId = decoded.userId;
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }

  const files = await FileModel.find({ userId }).sort({ uploadedAt: -1 });

  res.status(200).json(files);
}

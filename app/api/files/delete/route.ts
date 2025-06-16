import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { verifyToken } from "@/lib/utils/verifyToken";
import File from "@/models/File";
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";

const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function DELETE(req: NextRequest) {
  await connectDB();

  const token = req.headers.get("authorization")?.split(" ")[1];
  const userId = verifyToken(token);
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { fileId } = await req.json();
  const file = await File.findOne({ _id: fileId, userId });
  if (!file)
    return NextResponse.json({ error: "File not found" }, { status: 404 });

  await s3.send(
    new DeleteObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME!,
      Key: file.s3Key,
    })
  );

  await File.deleteOne({ _id: fileId });

  return NextResponse.json({ message: "File deleted" });
}

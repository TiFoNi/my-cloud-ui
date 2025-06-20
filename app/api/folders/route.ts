import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { verifyToken } from "@/lib/utils/verifyToken";
import Folder from "@/models/Folder";
import File from "@/models/File";
import { DeleteObjectsCommand, S3Client } from "@aws-sdk/client-s3";

const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function POST(req: NextRequest) {
  await connectDB();

  const token = req.headers.get("authorization")?.split(" ")[1];
  const userId = verifyToken(token);
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { name, parentId = null } = body;

  if (!name || typeof name !== "string") {
    return NextResponse.json({ error: "Invalid folder name" }, { status: 400 });
  }

  const newFolder = await Folder.create({ name, userId, parentId });

  return NextResponse.json(newFolder, { status: 201 });
}

export async function GET(req: NextRequest) {
  await connectDB();

  const token = req.headers.get("authorization")?.split(" ")[1];
  const userId = verifyToken(token);
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const folders = await Folder.find({ userId });

  return NextResponse.json(folders);
}

export async function DELETE(req: NextRequest) {
  await connectDB();

  const token = req.headers.get("authorization")?.split(" ")[1];
  const userId = verifyToken(token);
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { folderId } = await req.json();
  if (!folderId)
    return NextResponse.json({ error: "Missing folderId" }, { status: 400 });

  const allFolders = await Folder.find({ userId });

  const collectDescendantIds = (id: string): string[] => {
    const children = allFolders.filter((f) => f.parentId?.toString() === id);
    return children.flatMap((child) => [
      child._id.toString(),
      ...collectDescendantIds(child._id.toString()),
    ]);
  };

  const folderIdsToDelete = [folderId, ...collectDescendantIds(folderId)];

  const filesToDelete = await File.find({
    userId,
    folderId: { $in: folderIdsToDelete },
  });

  const s3Keys = filesToDelete.map((file) => ({ Key: file.s3Key }));

  if (s3Keys.length > 0) {
    await s3.send(
      new DeleteObjectsCommand({
        Bucket: process.env.AWS_BUCKET_NAME!,
        Delete: { Objects: s3Keys },
      })
    );
  }

  await File.deleteMany({ userId, folderId: { $in: folderIdsToDelete } });

  await Folder.deleteMany({ userId, _id: { $in: folderIdsToDelete } });

  return NextResponse.json({
    success: true,
    deletedFolders: folderIdsToDelete.length,
    deletedFiles: filesToDelete.length,
  });
}
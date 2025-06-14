import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { NextRequest } from "next/server";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const s3Key = searchParams.get("s3Key");
  const filename = searchParams.get("filename") || "file";

  if (!s3Key) {
    return new Response("Missing s3Key", { status: 400 });
  }

  const command = new GetObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME!,
    Key: s3Key,
  });

  try {
    const file = await s3.send(command);

    const body = file.Body as ReadableStream;

    return new Response(body, {
      headers: {
        "Content-Type": file.ContentType || "application/octet-stream",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (err) {
    console.error("Download error:", err);
    return new Response("Failed to download file", { status: 500 });
  }
}

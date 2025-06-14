import { NextRequest, NextResponse } from "next/server";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
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

  if (!s3Key) {
    return NextResponse.json({ error: "Missing s3Key" }, { status: 400 });
  }

  try {
    const command = new GetObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME!,
      Key: s3Key,
    });

    const signedUrl = await getSignedUrl(s3, command, { expiresIn: 60 });

    return NextResponse.json({ url: signedUrl });
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error("Signed URL generation error:", err.message);
    } else {
      console.error("Unknown error generating signed URL");
    }

    return NextResponse.json(
      { error: "Failed to generate signed URL" },
      { status: 500 }
    );
  }
}

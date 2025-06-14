import type { NextApiRequest, NextApiResponse } from "next";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

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
  const { s3Key } = req.query;

  if (!s3Key || typeof s3Key !== "string") {
    return res.status(400).json({ error: "Missing s3Key" });
  }

  const command = new GetObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME!,
    Key: s3Key,
  });

  try {
    const signedUrl = await getSignedUrl(s3, command, { expiresIn: 60 }); // 60 сек
    return res.status(200).json({ url: signedUrl });
  } catch (err) {
    return res.status(500).json({ error: "Failed to generate signed URL" });
  }
}

import type { NextApiRequest, NextApiResponse } from "next";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import https from "https";

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
  const { s3Key, filename } = req.query;
  if (!s3Key || typeof s3Key !== "string" || typeof filename !== "string") {
    return res.status(400).json({ error: "Missing params" });
  }

  const command = new GetObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME!,
    Key: s3Key,
  });

  try {
    const signedUrl = await getSignedUrl(s3, command, { expiresIn: 60 });

    https.get(signedUrl, (s3Res) => {
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${filename}"`
      );
      res.setHeader(
        "Content-Type",
        s3Res.headers["content-type"] || "application/octet-stream"
      );
      s3Res.pipe(res);
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to download file" });
  }
}

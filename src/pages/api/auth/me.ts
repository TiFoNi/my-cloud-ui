import { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const JWT_SECRET = process.env.JWT_SECRET!;
const MONGODB_URI = process.env.MONGODB_URI!;

const connectDB = async () => {
  if (mongoose.connections[0].readyState) return;
  await mongoose.connect(MONGODB_URI);
};

const UserSchema = new mongoose.Schema({
  email: String,
  password: String,
  nickname: String,
  role: String,
});
const User = mongoose.models.User || mongoose.model("User", UserSchema);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await connectDB();

  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "No token" });

  const token = authHeader.split(" ")[1];
  let decoded: any;

  try {
    decoded = jwt.verify(token, JWT_SECRET);
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }

  const user = await User.findById(decoded.userId);
  if (!user) return res.status(404).json({ error: "User not found" });

  if (req.method === "GET") {
    const { email, nickname, role } = user;
    return res.status(200).json({ email, nickname, role });
  }

  if (req.method === "PUT") {
    const { nickname, role } = req.body;

    if (nickname) user.nickname = nickname;
    if (role) user.role = role;

    await user.save();

    return res.status(200).json({ message: "User updated" });
  }

  return res.status(405).end("Method Not Allowed");
}

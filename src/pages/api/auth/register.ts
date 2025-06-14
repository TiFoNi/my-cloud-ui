import { NextApiRequest, NextApiResponse } from "next";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const MONGODB_URI = process.env.MONGODB_URI || "";

const connectDB = async () => {
  if (mongoose.connections[0].readyState) return;
  await mongoose.connect(MONGODB_URI);
};

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  nickname: { type: String, default: "NoName" },
  role: { type: String, default: "admin" },
});

const User = mongoose.models.User || mongoose.model("User", UserSchema);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") return res.status(405).end("Method not allowed");

  await connectDB();

  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ error: "Missing fields" });

  const existing = await User.findOne({ email });
  if (existing) return res.status(409).json({ error: "Email already exists" });

  const hash = await bcrypt.hash(password, 10);

  const newUser = await User.create({
    email,
    password: hash,
    nickname: "NoName",
    role: "admin",
  });

  return res.status(201).json({ message: "User created", userId: newUser._id });
}

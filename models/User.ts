import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  nickname: { type: String, default: "NoName" },
  role: { type: String, default: "user" },
  verifiedSessions: [
    {
      sessionId: String,
      verified: { type: Boolean, default: false },
      createdAt: { type: Date, default: Date.now },
    },
  ],
});

export const User = mongoose.models.User || mongoose.model("User", UserSchema);

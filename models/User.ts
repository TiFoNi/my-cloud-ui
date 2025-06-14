import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  nickname: { type: String, default: "NoName" },
  role: { type: String, default: "user" },
});

export const User = mongoose.models.User || mongoose.model("User", UserSchema);

import mongoose from "mongoose";
const { Schema } = mongoose;

const UserSchema = new Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  nickname: { type: String, default: "NoName" },

  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },

  department: {
    type: Schema.Types.ObjectId,
    ref: "Department",
    default: null,
  },

  verifiedSessions: [
    {
      sessionId: String,
      verified: { type: Boolean, default: false },
      createdAt: { type: Date, default: Date.now },
    },
  ],
});

export const User = mongoose.models.User || mongoose.model("User", UserSchema);

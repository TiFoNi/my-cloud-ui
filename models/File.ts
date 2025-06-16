import mongoose from "mongoose";

const fileSchema = new mongoose.Schema({
  userId: String,
  filename: String,
  s3Key: String,
  url: String,
  folderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Folder",
    default: null,
  },
  uploadedAt: { type: Date, default: Date.now },
});

export default mongoose.models.File || mongoose.model("File", fileSchema);

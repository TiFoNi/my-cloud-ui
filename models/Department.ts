import mongoose from "mongoose";
const { Schema } = mongoose;

const DepartmentSchema = new Schema({
  name: { type: String, required: true, unique: true },
  createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now },
});

export const Department =
  mongoose.models.Department || mongoose.model("Department", DepartmentSchema);

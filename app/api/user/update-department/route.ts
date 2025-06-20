import { connectDB } from "@/lib/db";
import { User } from "@/models/User";

export async function POST(req: Request) {
  await connectDB();
  const { email, departmentId } = await req.json();

  try {
    await User.findOneAndUpdate({ email }, { department: departmentId });
    return new Response("Department updated", { status: 200 });
  } catch (err) {
    console.error("Update error:", err);
    return new Response("Failed to update department", { status: 500 });
  }
}

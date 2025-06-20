import { connectDB } from "@/lib/db";
import { Department } from "@/models/Department";
import { User } from "@/models/User";

export async function POST(req: Request) {
  await connectDB();

  try {
    const { email, name } = await req.json();

    if (!email || !name) {
      return new Response("Missing email or department name", { status: 400 });
    }

    const user = await User.findOne({ email });

    if (!user || user.role !== "admin") {
      return new Response("Forbidden", { status: 403 });
    }

    const department = await Department.create({
      name,
      createdBy: user._id,
    });

    return Response.json(department);
  } catch (err) {
    console.error("Error creating department:", err);
    return new Response("Internal Server Error", { status: 500 });
  }
}

export async function GET() {
  await connectDB();

  try {
    const departments = await Department.find().select("name _id").lean();
    return Response.json(departments);
  } catch (err) {
    console.error("Error fetching departments:", err);
    return new Response("Failed to fetch departments", { status: 500 });
  }
}

import jwt from "jsonwebtoken";
import { JwtPayload } from "jsonwebtoken";

export function verifyToken(token?: string): string | null {
  try {
    const decoded = jwt.verify(token!, process.env.JWT_SECRET!) as JwtPayload;
    return decoded.userId as string;
  } catch {
    return null;
  }
}

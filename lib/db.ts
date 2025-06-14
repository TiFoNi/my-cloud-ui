import mongoose, { Connection } from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI!;
if (!MONGODB_URI) throw new Error("MONGODB_URI is not defined");

interface MongooseGlobal {
  conn: Connection | null;
  promise: Promise<Connection> | null;
}

declare global {
  var mongooseCache: MongooseGlobal | undefined;
}

const globalCache: MongooseGlobal = global.mongooseCache ?? {
  conn: null,
  promise: null,
};

export async function connectDB(): Promise<Connection> {
  if (globalCache.conn) return globalCache.conn;

  if (!globalCache.promise) {
    globalCache.promise = mongoose
      .connect(MONGODB_URI)
      .then((m) => m.connection);
  }

  globalCache.conn = await globalCache.promise;
  global.mongooseCache = globalCache;

  return globalCache.conn;
}

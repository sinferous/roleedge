import "server-only";
import { fileStore } from "./file-store";
import type { DataStore } from "./types";

export type * from "./types";

// DATA_PROVIDER=file (default) uses the local JSON stand-in.
// DATA_PROVIDER=supabase will use the Supabase implementation once the project exists (docs/DATABASE.md).
export function getStore(): DataStore {
  const provider = process.env.DATA_PROVIDER ?? "file";
  if (provider === "file") {
    // Serverless file systems are read-only and per-instance, so the stand-in would lose leads in production.
    if (process.env.VERCEL_ENV === "production") {
      throw new Error("DATA_PROVIDER=file cannot be used in production. Connect Supabase first.");
    }
    return fileStore;
  }
  throw new Error(`Data provider "${provider}" is not implemented yet`);
}

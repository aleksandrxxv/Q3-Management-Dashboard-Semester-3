// lib/data/dataMode.ts
export type DataMode = "fake" | "real";

export const DATA_MODE: DataMode =
  process.env.NEXT_PUBLIC_DATA_MODE === "real" ? "real" : "fake";

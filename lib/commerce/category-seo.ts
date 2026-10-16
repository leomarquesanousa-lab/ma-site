import { db } from "@/lib/db";
// Separate query keeps the pre-migration Client usable during staged rollout.
export async function categorySeo(id: string) {
  try {
    const rows = await db.$queryRaw<{seoTitle:string;seoDescription:string}[]>`SELECT "seoTitle", "seoDescription" FROM public."Category" WHERE id=${id}`;
    return rows[0] ?? {};
  } catch (error) {
    // Only an unapplied column migration has a safe content-derived fallback.
    if ((error as {meta?:{code?:string}}).meta?.code === "42703") return {};
    throw error;
  }
}

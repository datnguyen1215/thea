/**
 * Root layout server load: provides summary counts for nav badges.
 */
import { db } from "$lib/server/db.js";
import * as schema from "$lib/server/schema.js";
import { eq, sql } from "drizzle-orm";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async () => {
  const totalIssues =
    db
      .select({ count: sql<number>`count(*)` })
      .from(schema.issues)
      .get()?.count ?? 0;
  const openIssues =
    db
      .select({ count: sql<number>`count(*)` })
      .from(schema.issues)
      .where(eq(schema.issues.status, "open"))
      .get()?.count ?? 0;

  return { totalIssues, openIssues };
};

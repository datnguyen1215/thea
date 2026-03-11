/**
 * Server load for issues list page with filtering.
 */
import { db } from "$lib/server/db.js";
import * as schema from "$lib/server/schema.js";
import { eq, like, and, sql } from "drizzle-orm";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ url }) => {
  const status = url.searchParams.get("status");
  const priority = url.searchParams.get("priority");
  const search = url.searchParams.get("search");

  const conditions = [];

  if (status)
    conditions.push(
      eq(
        schema.issues.status,
        status as "open" | "in_progress" | "done" | "closed",
      ),
    );
  if (priority)
    conditions.push(
      eq(
        schema.issues.priority,
        priority as "low" | "medium" | "high" | "critical",
      ),
    );
  if (search) conditions.push(like(schema.issues.title, `%${search}%`));

  let issues;
  if (conditions.length > 0)
    issues = db
      .select()
      .from(schema.issues)
      .where(and(...conditions))
      .orderBy(sql`${schema.issues.id} desc`)
      .all();
  else
    issues = db
      .select()
      .from(schema.issues)
      .orderBy(sql`${schema.issues.id} desc`)
      .all();

  return { issues, filters: { status, priority, search } };
};

/**
 * API routes for issue collection: list and create.
 */
import { json } from "@sveltejs/kit";
import { eq, like, and, sql } from "drizzle-orm";
import { db } from "$lib/server/db.js";
import * as schema from "$lib/server/schema.js";
import type { RequestHandler } from "./$types";

/** @type {RequestHandler} */
export const GET: RequestHandler = async ({ url }) => {
  const status = url.searchParams.get("status");
  const priority = url.searchParams.get("priority");
  const label = url.searchParams.get("label");
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

  let issueRows;
  if (conditions.length > 0)
    issueRows = db
      .select()
      .from(schema.issues)
      .where(and(...conditions))
      .orderBy(sql`${schema.issues.id} desc`)
      .all();
  else
    issueRows = db
      .select()
      .from(schema.issues)
      .orderBy(sql`${schema.issues.id} desc`)
      .all();

  if (label) {
    const labelIssueIds = db
      .select({ issueId: schema.issueLabels.issueId })
      .from(schema.issueLabels)
      .where(eq(schema.issueLabels.label, label))
      .all()
      .map((r) => r.issueId);

    issueRows = issueRows.filter((issue) => labelIssueIds.includes(issue.id));
  }

  return json(issueRows);
};

/** @type {RequestHandler} */
export const POST: RequestHandler = async ({ request }) => {
  const body = await request.json();
  const { title, description = "", priority = "medium", labels = [] } = body;

  if (!title) return json({ error: "title is required" }, { status: 400 });

  const result = db
    .insert(schema.issues)
    .values({
      title,
      description,
      priority,
    })
    .returning()
    .get();

  if (labels.length > 0) {
    const labelRows = (labels as string[]).map((label) => ({
      issueId: result.id,
      label,
    }));
    db.insert(schema.issueLabels).values(labelRows).run();
  }

  db.insert(schema.issueEvents)
    .values({
      issueId: result.id,
      type: "created",
      detail: JSON.stringify({ title, priority }),
    })
    .run();

  return json(result, { status: 201 });
};

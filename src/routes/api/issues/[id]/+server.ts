/**
 * API routes for a single issue: get, update, delete.
 */
import { json, error } from "@sveltejs/kit";
import { eq, sql } from "drizzle-orm";
import { db } from "$lib/server/db.js";
import * as schema from "$lib/server/schema.js";
import type { RequestHandler } from "./$types";

/** @type {RequestHandler} */
export const GET: RequestHandler = async ({ params }) => {
  const id = Number(params.id);
  const issue = db
    .select()
    .from(schema.issues)
    .where(eq(schema.issues.id, id))
    .get();

  if (!issue) throw error(404, "Issue not found");

  const labels = db
    .select()
    .from(schema.issueLabels)
    .where(eq(schema.issueLabels.issueId, id))
    .all();
  const events = db
    .select()
    .from(schema.issueEvents)
    .where(eq(schema.issueEvents.issueId, id))
    .orderBy(sql`${schema.issueEvents.createdAt} desc`)
    .all();

  return json({ ...issue, labels, events });
};

/** @type {RequestHandler} */
export const PATCH: RequestHandler = async ({ params, request }) => {
  const id = Number(params.id);
  const issue = db
    .select()
    .from(schema.issues)
    .where(eq(schema.issues.id, id))
    .get();

  if (!issue) throw error(404, "Issue not found");

  const body = await request.json();
  const updates: Record<string, unknown> = {};
  const eventEntries: Array<{ type: string; detail: string }> = [];

  if (body.title !== undefined && body.title !== issue.title) {
    updates.title = body.title;
    eventEntries.push({
      type: "edited",
      detail: JSON.stringify({
        field: "title",
        from: issue.title,
        to: body.title,
      }),
    });
  }

  if (
    body.description !== undefined &&
    body.description !== issue.description
  ) {
    updates.description = body.description;
    eventEntries.push({
      type: "edited",
      detail: JSON.stringify({ field: "description" }),
    });
  }

  if (body.status !== undefined && body.status !== issue.status) {
    updates.status = body.status;
    eventEntries.push({
      type: "status_changed",
      detail: JSON.stringify({ from: issue.status, to: body.status }),
    });
  }

  if (body.priority !== undefined && body.priority !== issue.priority) {
    updates.priority = body.priority;
    eventEntries.push({
      type: "priority_changed",
      detail: JSON.stringify({ from: issue.priority, to: body.priority }),
    });
  }

  if (
    body.agentSession !== undefined &&
    body.agentSession !== issue.agentSession
  ) {
    const type = body.agentSession ? "agent_assigned" : "agent_unassigned";
    updates.agentSession = body.agentSession;
    eventEntries.push({
      type,
      detail: JSON.stringify({
        session: body.agentSession ?? issue.agentSession,
      }),
    });
  }

  if (Object.keys(updates).length > 0) {
    updates.updatedAt = new Date().toISOString().replace("T", " ").slice(0, 19);
    db.update(schema.issues).set(updates).where(eq(schema.issues.id, id)).run();
  }

  if (body.labels !== undefined) {
    db.delete(schema.issueLabels)
      .where(eq(schema.issueLabels.issueId, id))
      .run();
    const newLabels = (body.labels as string[]).filter(Boolean);
    if (newLabels.length > 0) {
      db.insert(schema.issueLabels)
        .values(newLabels.map((label) => ({ issueId: id, label })))
        .run();
    }
  }

  for (const entry of eventEntries) {
    db.insert(schema.issueEvents)
      .values({
        issueId: id,
        type: entry.type as
          | "created"
          | "status_changed"
          | "priority_changed"
          | "edited"
          | "agent_assigned"
          | "agent_unassigned",
        detail: entry.detail,
      })
      .run();
  }

  const updated = db
    .select()
    .from(schema.issues)
    .where(eq(schema.issues.id, id))
    .get();
  return json(updated);
};

/** @type {RequestHandler} */
export const DELETE: RequestHandler = async ({ params }) => {
  const id = Number(params.id);
  const issue = db
    .select()
    .from(schema.issues)
    .where(eq(schema.issues.id, id))
    .get();

  if (!issue) throw error(404, "Issue not found");

  db.delete(schema.issues).where(eq(schema.issues.id, id)).run();

  return json({ success: true });
};

/**
 * Server load and actions for editing an issue.
 */
import { error, redirect } from "@sveltejs/kit";
import { eq } from "drizzle-orm";
import { db } from "$lib/server/db.js";
import * as schema from "$lib/server/schema.js";
import type { PageServerLoad, Actions } from "./$types";

export const load: PageServerLoad = async ({ params }) => {
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

  return { issue, labels };
};

export const actions: Actions = {
  default: async ({ params, request }) => {
    const id = Number(params.id);
    const issue = db
      .select()
      .from(schema.issues)
      .where(eq(schema.issues.id, id))
      .get();

    if (!issue) throw error(404, "Issue not found");

    const formData = await request.formData();
    const title = (formData.get("title") as string)?.trim();
    const description = (formData.get("description") as string)?.trim() ?? "";
    const priority = (formData.get("priority") as string) ?? issue.priority;
    const labelsRaw = (formData.get("labels") as string) ?? "";

    if (!title) return { error: "Title is required" };

    const eventEntries: Array<{
      type: "edited" | "priority_changed";
      detail: string;
    }> = [];

    if (title !== issue.title)
      eventEntries.push({
        type: "edited",
        detail: JSON.stringify({
          field: "title",
          from: issue.title,
          to: title,
        }),
      });

    if (description !== issue.description)
      eventEntries.push({
        type: "edited",
        detail: JSON.stringify({ field: "description" }),
      });

    if (priority !== issue.priority)
      eventEntries.push({
        type: "priority_changed",
        detail: JSON.stringify({ from: issue.priority, to: priority }),
      });

    db.update(schema.issues)
      .set({
        title,
        description,
        priority: priority as "low" | "medium" | "high" | "critical",
        updatedAt: new Date().toISOString().replace("T", " ").slice(0, 19),
      })
      .where(eq(schema.issues.id, id))
      .run();

    db.delete(schema.issueLabels)
      .where(eq(schema.issueLabels.issueId, id))
      .run();

    const newLabels = labelsRaw
      .split(",")
      .map((l) => l.trim())
      .filter(Boolean);
    if (newLabels.length > 0) {
      db.insert(schema.issueLabels)
        .values(newLabels.map((label) => ({ issueId: id, label })))
        .run();
    }

    for (const entry of eventEntries) {
      db.insert(schema.issueEvents)
        .values({ issueId: id, type: entry.type, detail: entry.detail })
        .run();
    }

    redirect(303, `/issues/${id}`);
  },
};

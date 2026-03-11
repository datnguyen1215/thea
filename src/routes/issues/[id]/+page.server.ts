/**
 * Server load and actions for issue detail page.
 */
import { error, redirect } from "@sveltejs/kit";
import { eq, desc } from "drizzle-orm";
import { db } from "$lib/server/db.js";
import * as schema from "$lib/server/schema.js";
import type { PageServerLoad, Actions } from "./$types";

export const load: PageServerLoad = async ({ params }) => {
  const id = Number(params.id);
  if (Number.isNaN(id)) throw error(400, "Invalid issue ID");

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
    .orderBy(desc(schema.issueEvents.createdAt))
    .all();

  return { issue, labels, events };
};

export const actions: Actions = {
  updateStatus: async ({ params, request }) => {
    const id = Number(params.id);
    const formData = await request.formData();
    const newStatus = formData.get("status") as string;
    const issue = db
      .select()
      .from(schema.issues)
      .where(eq(schema.issues.id, id))
      .get();

    if (!issue) throw error(404, "Issue not found");

    db.update(schema.issues)
      .set({
        status: newStatus as "open" | "in_progress" | "done" | "closed",
        updatedAt: new Date().toISOString().replace("T", " ").slice(0, 19),
      })
      .where(eq(schema.issues.id, id))
      .run();

    db.insert(schema.issueEvents)
      .values({
        issueId: id,
        type: "status_changed",
        detail: JSON.stringify({ from: issue.status, to: newStatus }),
      })
      .run();
  },

  delete: async ({ params }) => {
    const id = Number(params.id);
    const issue = db
      .select()
      .from(schema.issues)
      .where(eq(schema.issues.id, id))
      .get();

    if (!issue) throw error(404, "Issue not found");

    db.delete(schema.issues).where(eq(schema.issues.id, id)).run();

    redirect(303, "/issues");
  },
};

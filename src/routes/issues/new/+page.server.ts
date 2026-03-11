/**
 * Server actions for creating a new issue.
 */
import { redirect } from "@sveltejs/kit";
import { db } from "$lib/server/db.js";
import * as schema from "$lib/server/schema.js";
import type { Actions } from "./$types";

export const actions: Actions = {
  default: async ({ request }) => {
    const formData = await request.formData();
    const title = formData.get("title") as string;
    const description = (formData.get("description") as string) ?? "";
    const priority = (formData.get("priority") as string) ?? "medium";
    const labelsRaw = (formData.get("labels") as string) ?? "";

    if (!title?.trim()) return { error: "Title is required" };

    const result = db
      .insert(schema.issues)
      .values({
        title: title.trim(),
        description: description.trim(),
        priority: priority as "low" | "medium" | "high" | "critical",
      })
      .returning()
      .get();

    const labels = labelsRaw
      .split(",")
      .map((l) => l.trim())
      .filter(Boolean);
    if (labels.length > 0) {
      db.insert(schema.issueLabels)
        .values(labels.map((label) => ({ issueId: result.id, label })))
        .run();
    }

    db.insert(schema.issueEvents)
      .values({
        issueId: result.id,
        type: "created",
        detail: JSON.stringify({ title: result.title, priority }),
      })
      .run();

    redirect(303, `/issues/${result.id}`);
  },
};

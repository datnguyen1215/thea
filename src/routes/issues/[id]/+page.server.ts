import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types.js";
import { db } from "$lib/server/db.js";
import { issues, issueEvents, issueLabels } from "$lib/server/schema.js";
import { eq, desc } from "drizzle-orm";

export const load: PageServerLoad = ({ params }) => {
  const id = Number(params.id);
  if (Number.isNaN(id)) throw error(400, "Invalid issue ID");

  const issue = db.select().from(issues).where(eq(issues.id, id)).get();
  if (!issue) throw error(404, "Issue not found");

  const labels = db
    .select()
    .from(issueLabels)
    .where(eq(issueLabels.issueId, id))
    .all();

  const events = db
    .select()
    .from(issueEvents)
    .where(eq(issueEvents.issueId, id))
    .orderBy(desc(issueEvents.createdAt))
    .all();

  return { issue, labels, events };
};

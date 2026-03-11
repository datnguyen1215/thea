import { json, error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types.js";
import * as ao from "$lib/server/ao.js";
import { db } from "$lib/server/db.js";
import { issues, issueEvents } from "$lib/server/schema.js";
import { eq } from "drizzle-orm";

export const POST: RequestHandler = async ({ request }) => {
  const { issueId } = await request.json();
  if (!issueId) throw error(400, "issueId is required");

  const issue = db.select().from(issues).where(eq(issues.id, issueId)).get();
  if (!issue) throw error(404, "Issue not found");
  if (issue.agentSession)
    throw error(409, "Issue already has an agent assigned");

  const sessionName = ao.spawn(issueId);

  db.update(issues)
    .set({ agentSession: sessionName, updatedAt: new Date().toISOString() })
    .where(eq(issues.id, issueId))
    .run();

  db.insert(issueEvents)
    .values({
      issueId,
      type: "agent_assigned",
      detail: JSON.stringify({ session: sessionName }),
    })
    .run();

  return json({ session: sessionName });
};

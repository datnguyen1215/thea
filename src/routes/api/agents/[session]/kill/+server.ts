import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types.js";
import * as ao from "$lib/server/ao.js";
import { db } from "$lib/server/db.js";
import { issues, issueEvents } from "$lib/server/schema.js";
import { eq } from "drizzle-orm";

export const POST: RequestHandler = async ({ params }) => {
  const session = params.session;
  ao.kill(session);

  const issue = db
    .select()
    .from(issues)
    .where(eq(issues.agentSession, session))
    .get();

  if (issue) {
    db.update(issues)
      .set({ agentSession: null, updatedAt: new Date().toISOString() })
      .where(eq(issues.id, issue.id))
      .run();

    db.insert(issueEvents)
      .values({
        issueId: issue.id,
        type: "agent_unassigned",
        detail: JSON.stringify({ session }),
      })
      .run();
  }

  return json({ ok: true });
};

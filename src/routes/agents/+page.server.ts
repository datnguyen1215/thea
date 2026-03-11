import type { PageServerLoad } from "./$types.js";
import * as ao from "$lib/server/ao.js";
import { db } from "$lib/server/db.js";
import { issues } from "$lib/server/schema.js";

export const load: PageServerLoad = () => {
  const status = ao.getStatus() as { sessions?: unknown[] };
  const allIssues = db.select().from(issues).all();

  const sessionToIssue = new Map<string, (typeof allIssues)[0]>();
  for (const issue of allIssues) {
    if (issue.agentSession) sessionToIssue.set(issue.agentSession, issue);
  }

  return {
    status,
    sessionToIssue: Object.fromEntries(sessionToIssue),
    issues: allIssues,
  };
};

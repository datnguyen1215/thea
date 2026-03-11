import { json, error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types.js";
import * as ao from "$lib/server/ao.js";

export const POST: RequestHandler = async ({ params, request }) => {
  const { message } = await request.json();
  if (!message) throw error(400, "message is required");

  const output = ao.send(params.session, message);
  return json({ output });
};

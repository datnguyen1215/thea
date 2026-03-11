import { json } from "@sveltejs/kit";
import * as ao from "$lib/server/ao.js";

export const GET = () => {
  const status = ao.getStatus();
  return json(status);
};

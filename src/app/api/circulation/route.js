import { listCirculation } from "@/server/circulation-queries";
import { listResponse } from "@/app/api/list-response";

export async function GET(request) {
  return listResponse(request, listCirculation);
}

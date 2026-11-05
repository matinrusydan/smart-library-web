import { connection } from "next/server";
import { listCirculation } from "@/server/circulation-queries";
import CirculationPage from "@/features/circulation/CirculationPage";

export default async function Page() {
  await connection();
  const initialData = await listCirculation({ kind: "returns", page: 1, pageSize: 10 });
  return <CirculationPage kind="returns" initialData={initialData} />;
}

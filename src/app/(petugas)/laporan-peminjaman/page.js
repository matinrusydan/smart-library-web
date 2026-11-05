import { connection } from "next/server";
import { listCirculation } from "@/server/circulation-queries";
import CirculationPage from "@/features/circulation/CirculationPage";

export default async function Page() {
  await connection();
  const initialData = await listCirculation({ kind: "borrowing-report", page: 1, pageSize: 10 });
  return <CirculationPage kind="borrowing-report" initialData={initialData} />;
}

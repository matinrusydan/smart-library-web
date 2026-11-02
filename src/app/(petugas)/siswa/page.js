import { listStudents } from "@/server/queries";
import { RecordsLoader } from "@/features/library/RecordsLoader";
import { connection } from "next/server";
export default async function StudentsPage(){await connection();const initialData=await listStudents({page:1,pageSize:10});return <RecordsLoader kind="students" initialData={initialData}/>}

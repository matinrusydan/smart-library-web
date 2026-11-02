import { listCategories } from "@/server/queries";
import { RecordsLoader } from "@/features/library/RecordsLoader";
import { connection } from "next/server";
export default async function CategoriesPage(){await connection();const initialData=await listCategories({page:1,pageSize:10});return <RecordsLoader kind="categories" initialData={initialData}/>}

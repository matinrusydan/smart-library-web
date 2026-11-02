import { listBooks } from "@/server/queries";
import { RecordsLoader } from "@/features/library/RecordsLoader";
import { listCategories } from "@/server/queries";
import { connection } from "next/server";
export default async function BooksPage(){await connection();const [initialData,categories]=await Promise.all([listBooks({page:1,pageSize:10}),listCategories({page:1,pageSize:100,active:"true"})]);return <RecordsLoader kind="books" initialData={initialData} categories={categories.items}/>}

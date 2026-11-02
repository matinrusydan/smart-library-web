import { redirect } from "next/navigation";
import { getCurrentUser } from "@/server/auth";
import { StaffShell } from "@/features/layout/StaffShell";
import { connection } from "next/server";
export default async function StaffLayout({children}){await connection();const user=await getCurrentUser();if(!user)redirect("/login");if(!["petugas","superadmin"].includes(user.role))redirect("/login");return <StaffShell user={user}>{children}</StaffShell>}

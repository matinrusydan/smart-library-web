"use server";
import { redirect } from "next/navigation";
import { authenticateUser, revokeCurrentSession } from "@/server/auth";

export async function loginAction(_previousState, formData) {
  const username = formData.get("username");
  const password = formData.get("password");
  if (typeof username !== "string" || typeof password !== "string" || !username.trim() || !password || password.length > 1024) return { error: "Nama pengguna atau kata sandi tidak valid" };
  try {
    const user = await authenticateUser({ username, password });
    return user ? { success: true, user: { name: user.name, role: user.role } } : { error: "Nama pengguna atau kata sandi tidak valid" };
  } catch { return { error: "Tidak dapat masuk saat ini" }; }
}

export async function logoutAction() {
  await revokeCurrentSession();
  redirect("/login");
}

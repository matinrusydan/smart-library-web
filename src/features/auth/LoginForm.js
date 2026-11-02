"use client";
import { useActionState, useEffect } from "react";
import { loginAction } from "@/app/actions/auth";
import { useRouter } from "next/navigation";

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, null);
  const router=useRouter();
  useEffect(()=>{if(state?.success){router.replace("/");router.refresh()}},[state,router]);
  return <form action={action} className="space-y-3"><label className="block text-xs font-semibold text-text" htmlFor="username">Nama pengguna<input required autoComplete="username" id="username" name="username" className="mt-1 w-full rounded-md border border-border bg-surface px-2.5 py-2 text-[13px] font-normal outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10" placeholder="Masukkan nama pengguna" /></label><label className="block text-xs font-semibold text-text" htmlFor="password">Kata sandi<input required autoComplete="current-password" id="password" name="password" type="password" className="mt-1 w-full rounded-md border border-border bg-surface px-2.5 py-2 text-[13px] font-normal outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10" placeholder="Masukkan kata sandi" /></label>{state?.error&&<p role="alert" className="rounded-lg bg-danger/10 p-3 text-sm text-danger">{state.error}</p>}<button disabled={pending} className="w-full rounded-md bg-primary px-4 py-2 text-[13px] font-medium text-on-primary transition hover:opacity-90 disabled:opacity-60">{pending?"Memeriksa…":"Masuk ke Dashboard"}</button></form>;
}

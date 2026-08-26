"use client";

import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    router.push("/");
    router.refresh();
  }

  return (
    <button
      onClick={logout}
      className="inline-flex h-10 cursor-pointer items-center rounded-lg border border-border px-5 font-display text-xs font-bold uppercase tracking-wide transition-colors hover:border-red-500 hover:text-red-500"
    >
      Cerrar sesión
    </button>
  );
}

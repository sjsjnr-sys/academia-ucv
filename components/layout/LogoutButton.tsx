'use client'

import { LogOut } from "lucide-react"
import { logout } from "@/app/(auth)/actions"
import { useTransition } from "react"
import { Loader2 } from "lucide-react"

export function LogoutButton() {
  const [isPending, startTransition] = useTransition()

  const handleLogout = () => {
    startTransition(async () => {
      await logout()
    })
  }

  return (
    <button
      onClick={handleLogout}
      disabled={isPending}
      className="flex items-center gap-3 px-3 py-2 w-full text-left text-error font-medium hover:bg-error/10 transition-colors rounded-md disabled:opacity-50"
    >
      {isPending ? (
        <Loader2 className="w-[18px] h-[18px] animate-spin" />
      ) : (
        <LogOut className="w-[18px] h-[18px]" />
      )}
      <span className="text-sm">{isPending ? "Cerrando..." : "Cerrar Sesión"}</span>
    </button>
  )
}

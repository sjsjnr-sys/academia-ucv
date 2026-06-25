'use client'

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { BookOpen, Loader2, AlertCircle } from "lucide-react"
import { useActionState } from "react"
import { login } from "../actions"

const initialState = { error: undefined as string | undefined }

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(
    async (_prev: typeof initialState, formData: FormData) => {
      const result = await login(formData)
      return result ?? initialState
    },
    initialState
  )

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-base p-4">
      <Card className="w-full max-w-[400px] p-8 shadow-lg border-border-subtle bg-bg-elevated flex flex-col items-center">
        {/* Logo */}
        <div className="w-12 h-12 bg-primary-500 rounded-xl flex items-center justify-center mb-4">
          <BookOpen className="w-6 h-6 text-white" />
        </div>
        <h1 className="font-display text-2xl font-bold text-primary-500 mb-1">AcademIA</h1>
        <p className="text-text-secondary text-sm mb-8">Gestor de Tareas Académicas</p>

        {/* Error banner */}
        {state?.error && (
          <div className="w-full mb-4 flex items-start gap-2 rounded-md bg-error-bg border border-priority-high-border px-4 py-3">
            <AlertCircle className="w-4 h-4 text-error mt-0.5 shrink-0" />
            <p className="text-sm text-error">{state.error}</p>
          </div>
        )}

        <form action={formAction} className="w-full space-y-4">
          <div className="space-y-1">
            <label htmlFor="email" className="text-xs font-semibold text-text-secondary">
              Email
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="tu@email.com"
              required
              autoComplete="email"
              className="bg-bg-sunken border-border-default focus-visible:ring-primary-500/20"
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="password" className="text-xs font-semibold text-text-secondary">
              Contraseña
            </label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              required
              autoComplete="current-password"
              className="bg-bg-sunken border-border-default focus-visible:ring-primary-500/20"
            />
          </div>

          <Button
            type="submit"
            disabled={isPending}
            className="w-full mt-6 bg-primary-500 hover:bg-primary-600 text-white font-medium disabled:opacity-60"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Iniciando sesión...
              </>
            ) : (
              "Iniciar Sesión"
            )}
          </Button>
        </form>

        <p className="text-sm text-text-tertiary mt-6">
          ¿No tienes cuenta?{" "}
          <Link href="/signup" className="text-primary-500 hover:underline font-medium">
            Regístrate
          </Link>
        </p>
      </Card>
    </div>
  )
}

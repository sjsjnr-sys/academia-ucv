import Link from "next/link";
import { BookOpen, Plus, Settings, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LogoutButton } from "@/components/layout/LogoutButton";
import { SidebarNav } from "@/components/layout/SidebarNav";
import { createClient } from "@/lib/supabase/server";

export async function Sidebar() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const displayName = user?.user_metadata?.full_name
    ? (user.user_metadata.full_name as string).split(' ')[0]
    : user?.email?.split('@')[0] ?? 'Estudiante'

  // Fetch active courses to render in sidebar
  const { data: courses } = await supabase
    .from("courses")
    .select("id, name, color")
    .order("name", { ascending: true })

  return (
    <aside className="w-[240px] md:w-[280px] h-screen sticky left-0 top-0 bg-bg-elevated border-r border-border-subtle flex flex-col py-6 px-4 z-40 hidden md:flex">
      <div className="flex items-center gap-2 mb-10 px-3">
        <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
          <BookOpen className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="font-display text-xl font-bold text-primary-500 tracking-tight">AcademIA</h1>
          <p className="font-sans text-[10px] font-semibold text-text-tertiary uppercase tracking-wider">Master&apos;s Workspace</p>
        </div>
      </div>

      <Link href="/tasks" className="w-full mb-8">
        <Button className="w-full font-medium justify-center gap-2 bg-primary-500 hover:bg-primary-600 text-white cursor-pointer">
          <Plus className="w-4 h-4" />
          Nueva Tarea
        </Button>
      </Link>

      <SidebarNav courses={courses || []} />

      <div className="mt-auto space-y-1 pt-4 border-t border-border-subtle">
        {/* User info chip */}
        {user && (
          <div className="flex items-center gap-2 px-3 py-2 mb-2">
            <div className="w-7 h-7 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-xs uppercase shrink-0">
              {displayName.charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-text-primary truncate">{displayName}</p>
              <p className="text-[10px] text-text-tertiary truncate">{user.email}</p>
            </div>
          </div>
        )}
        <Link href="#" className="flex items-center gap-3 px-3 py-2 text-text-secondary font-medium hover:bg-bg-sunken transition-colors rounded-md">
          <Settings className="w-[18px] h-[18px]" />
          <span className="text-sm">Ajustes</span>
        </Link>
        <Link href="#" className="flex items-center gap-3 px-3 py-2 text-text-secondary font-medium hover:bg-bg-sunken transition-colors rounded-md">
          <HelpCircle className="w-[18px] h-[18px]" />
          <span className="text-sm">Ayuda</span>
        </Link>
        <LogoutButton />
      </div>
    </aside>
  );
}

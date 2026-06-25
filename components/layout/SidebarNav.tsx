'use client'

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, CheckSquare, LayoutDashboard } from "lucide-react";
import { Course } from "@/types/database";

export function SidebarNav({ courses }: { courses: Pick<Course, 'id' | 'name' | 'color'>[] }) {
  const pathname = usePathname()

  const links = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/courses", label: "Mis Cursos", icon: BookOpen },
    { href: "/tasks", label: "Tareas", icon: CheckSquare },
  ]

  return (
    <nav className="flex-1 space-y-1 overflow-y-auto">
      {/* Main Nav Tabs */}
      {links.map((link) => {
        const Icon = link.icon
        const isActive = pathname === link.href

        return (
          <Link
            key={link.href}
            href={link.href}
            className={`flex items-center gap-3 px-3 py-2 transition-colors rounded-md ${
              isActive
                ? "text-primary-500 font-bold border-r-4 border-primary-500 bg-primary-50/50 dark:bg-primary-950/20"
                : "text-text-secondary font-medium hover:bg-bg-sunken"
            }`}
          >
            <Icon className="w-[18px] h-[18px]" />
            <span className="text-sm">{link.label}</span>
          </Link>
        )
      })}

      {/* Active Courses Section */}
      <div className="mt-8 pt-6 border-t border-border-subtle">
        <p className="px-3 text-xs font-semibold text-text-tertiary mb-2 uppercase tracking-wider font-sans">Cursos Activos</p>
        {courses.length === 0 ? (
          <p className="px-3 text-xs text-text-tertiary italic">No hay cursos registrados</p>
        ) : (
          courses.map((course) => (
            <Link
              key={course.id}
              href={`/tasks?course=${course.id}`}
              className="flex items-center gap-3 px-3 py-1.5 text-text-secondary font-medium hover:bg-bg-sunken transition-colors rounded-md group"
            >
              <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: course.color }} />
              <span className="text-sm truncate">{course.name}</span>
            </Link>
          ))
        )}
      </div>
    </nav>
  )
}

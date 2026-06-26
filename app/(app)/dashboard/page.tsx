import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle2, AlertCircle, BookOpen, TrendingUp } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Dashboard - AcademIA",
  description: "Resumen de tus actividades, métricas académicas y próximas entregas.",
};

export default async function DashboardPage() {
  const supabase = await createClient();

  // Fetch all tasks for statistics and upcoming list
  const { data: tasks, error: tasksError } = await supabase
    .from("tasks")
    .select("*, courses:courses(*)");

  if (tasksError) {
    console.error("Error fetching tasks for dashboard:", tasksError.message);
  }

  const allTasks = tasks || [];

  // Calculate statistics
  const pendingTasks = allTasks.filter(t => t.status !== "COMPLETED");
  const completedTasks = allTasks.filter(t => t.status === "COMPLETED");

  const todayStr = new Date().toISOString().split("T")[0];

  // Soon to expire = pending tasks with due_date <= today + 2 days (today, tomorrow, or overdue)
  const twoDaysLater = new Date();
  twoDaysLater.setDate(twoDaysLater.getDate() + 2);
  const twoDaysLaterStr = twoDaysLater.toISOString().split("T")[0];

  const soonToExpireTasks = pendingTasks.filter(
    t => t.due_date && t.due_date <= twoDaysLaterStr
  );

  // Top 5 upcoming tasks
  const upcomingTasks = [...pendingTasks]
    .filter(t => t.due_date !== null)
    .sort((a, b) => a.due_date!.localeCompare(b.due_date!))
    .slice(0, 5);

  // Helper to format counts as 2 digits
  const formatCount = (count: number) => {
    return count < 10 ? `0${count}` : `${count}`;
  };

  // Helper to format due dates
  const formatDueDate = (dateStr: string | null) => {
    if (!dateStr) return "";
    const [year, month, day] = dateStr.split('-').map(Number);
    const dateVal = new Date(year, month - 1, day);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const dateCompare = new Date(dateVal);
    dateCompare.setHours(0, 0, 0, 0);

    if (dateCompare.getTime() === today.getTime()) {
      return "Hoy";
    } else if (dateCompare.getTime() === tomorrow.getTime()) {
      return "Mañana";
    } else {
      return dateVal.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
    }
  };

  const priorityStyles: Record<string, string> = {
    high: "bg-priority-high-bg text-priority-high border-priority-high-border",
    medium: "bg-priority-medium-bg text-priority-medium border-priority-medium-border",
    low: "bg-priority-low-bg text-priority-low border-priority-low-border",
  };

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Metrics Section */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 flex items-center justify-between hover:border-primary transition-colors cursor-default bg-bg-elevated border-border-default">
          <div>
            <p className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-1">Tareas Pendientes</p>
            <h3 className="font-display text-4xl text-primary">{formatCount(pendingTasks.length)}</h3>
          </div>
          <div className="bg-primary-50 p-4 rounded-xl text-primary dark:bg-primary-900/20">
            <Clock className="w-8 h-8" />
          </div>
        </Card>
        <Card className="p-6 flex items-center justify-between hover:border-success transition-colors cursor-default bg-bg-elevated border-border-default">
          <div>
            <p className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-1">Completadas</p>
            <h3 className="font-display text-4xl text-success">{formatCount(completedTasks.length)}</h3>
          </div>
          <div className="bg-success-bg p-4 rounded-xl text-success dark:bg-success-bg/10">
            <CheckCircle2 className="w-8 h-8" />
          </div>
        </Card>
        <Card className="p-6 flex items-center justify-between hover:border-error transition-colors cursor-default bg-bg-elevated border-border-default">
          <div>
            <p className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-1">Próximas a Vencer</p>
            <h3 className="font-display text-4xl text-error">{formatCount(soonToExpireTasks.length)}</h3>
          </div>
          <div className="bg-error-bg p-4 rounded-xl text-error dark:bg-error-bg/10">
            <AlertCircle className="w-8 h-8" />
          </div>
        </Card>
      </section>

      {/* Central Progress Chart Section (Mock) */}
      <Card className="p-6 flex flex-col h-[320px] bg-bg-elevated border-border-default">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-text-primary">Progreso de Entregas Semanal</h2>
          <div className="flex gap-4">
            <span className="flex items-center gap-1.5 text-[10px] font-semibold text-text-tertiary uppercase">
              <span className="w-2 h-2 rounded-full bg-primary"></span> Entregado
            </span>
            <span className="flex items-center gap-1.5 text-[10px] font-semibold text-text-tertiary uppercase">
              <span className="w-2 h-2 rounded-full bg-border-default"></span> Pendiente
            </span>
          </div>
        </div>
        <div className="flex-1 flex items-end justify-between gap-2 pb-2">
          {/* Mock bars */}
          {[40, 70, 25, 90, 55, 15, 10].map((h, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-3">
              <div className="w-full flex flex-col-reverse h-40 bg-bg-sunken rounded-sm overflow-hidden border border-border-subtle">
                <div className="bg-primary transition-all duration-500 ease-out" style={{ height: `${h}%` }}></div>
              </div>
              <span className="text-[10px] font-semibold text-text-tertiary uppercase">
                {['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB', 'DOM'][i]}
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* Bottom Tasks Section */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Próximas Tareas */}
        <Card className="lg:col-span-2 overflow-hidden flex flex-col bg-bg-elevated border-border-default">
          <div className="px-6 py-4 border-b border-border-subtle flex justify-between items-center">
            <h2 className="text-lg font-semibold text-text-primary">Próximas Tareas</h2>
            <Link href="/tasks" className="text-primary text-xs font-semibold hover:underline uppercase tracking-wider">
              Ver todas
            </Link>
          </div>
          <div className="divide-y divide-border-subtle flex-1 overflow-y-auto">
            {upcomingTasks.length === 0 ? (
              <div className="p-8 text-center text-text-secondary text-sm">
                No tienes tareas pendientes programadas con fecha límite.
              </div>
            ) : (
              upcomingTasks.map(task => {
                const isOverdue = task.due_date && task.due_date < todayStr;
                const courseColor = task.courses?.color || "#C5C4C1";

                return (
                  <div
                    key={task.id}
                    className="group flex items-center gap-4 px-6 py-4 hover:bg-bg-sunken/50 transition-colors"
                  >
                    <div className="w-1.5 h-8 rounded-full shrink-0" style={{ backgroundColor: courseColor }} />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-text-primary truncate">{task.title}</h4>
                      <p className="text-[10px] font-semibold text-text-tertiary uppercase tracking-wider truncate">
                        {task.courses ? `${task.courses.name} (${task.courses.code})` : "Sin Curso"}
                      </p>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                      <span className={`flex items-center gap-1.5 text-sm font-medium ${isOverdue ? "text-error" : "text-text-secondary"}`}>
                        <Clock className="w-4 h-4" /> {formatDueDate(task.due_date)}
                      </span>
                      <Badge variant="outline" className={`hidden sm:inline-flex px-2 py-0.5 text-[10px] font-bold ${priorityStyles[task.priority]}`}>
                        {task.priority.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Card>

        {/* Resumen Académico */}
        <Card className="p-6 bg-bg-elevated border-border-default">
          <h2 className="text-lg font-semibold text-text-primary mb-6">Resumen Académico</h2>
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-bg-sunken flex items-center justify-center shrink-0">
                <BookOpen className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-text-primary">Has citado 12 nuevas fuentes esta semana.</p>
                <p className="text-[10px] font-semibold text-text-tertiary uppercase mt-1">HACE 2 HORAS</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-bg-sunken flex items-center justify-center shrink-0">
                <TrendingUp className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <p className="text-sm text-text-primary">Tu promedio general ha subido a 9.2/10.</p>
                <p className="text-[10px] font-semibold text-text-tertiary uppercase mt-1">AYER</p>
              </div>
            </div>

            <div className="mt-8 p-4 bg-primary-50 border border-primary-200 rounded-lg dark:bg-primary-950/20 dark:border-primary-800">
              <p className="text-[10px] font-semibold text-primary uppercase tracking-wider mb-2">ESTADO DE TESIS</p>
              <div className="w-full bg-bg-sunken rounded-full h-1.5 mb-3 overflow-hidden border border-border-subtle">
                <div className="bg-primary h-full w-[64%]"></div>
              </div>
              <p className="text-xs text-text-secondary">Capítulo 3: Metodología en curso (64% completado)</p>
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
}

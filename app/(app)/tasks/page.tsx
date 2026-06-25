import { createClient } from "@/lib/supabase/server";
import { TaskListClient } from "@/components/tasks/TaskListClient";

export const metadata = {
  title: "Tareas - AcademIA",
  description: "Organiza y filtra tus entregables académicos por curso, prioridad o estado.",
};

export default async function TasksPage() {
  const supabase = await createClient();

  // Fetch courses (to feed the filter dropdown and task form)
  const { data: courses, error: coursesError } = await supabase
    .from("courses")
    .select("*")
    .order("name", { ascending: true });

  if (coursesError) {
    console.error("Error fetching courses for tasks:", coursesError.message);
  }

  // Fetch tasks with their related course data using left join
  const { data: tasks, error: tasksError } = await supabase
    .from("tasks")
    .select("*, courses:courses(*)")
    .order("created_at", { ascending: false });

  if (tasksError) {
    console.error("Error fetching tasks:", tasksError.message);
  }

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto flex flex-col h-full">
      <div>
        <h1 className="font-display text-3xl font-bold text-text-primary">Tareas</h1>
        <p className="text-sm text-text-secondary mt-1">Gestiona tus entregables y prioridades</p>
      </div>

      <TaskListClient
        initialTasks={tasks || []}
        courses={courses || []}
      />
    </div>
  );
}

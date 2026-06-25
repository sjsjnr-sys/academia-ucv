import { createClient } from "@/lib/supabase/server";
import { CourseListClient } from "@/components/courses/CourseListClient";

export const metadata = {
  title: "Mis Cursos - AcademIA",
  description: "Administra tus asignaturas y colores asociados.",
};

export default async function CoursesPage() {
  const supabase = await createClient();
  const { data: courses, error } = await supabase
    .from("courses")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching courses:", error.message);
  }

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="font-display text-3xl font-bold text-text-primary">Mis Cursos</h1>
        <p className="text-sm text-text-secondary mt-1">Registra y administra tus asignaturas académicas.</p>
      </div>
      <CourseListClient initialCourses={courses || []} />
    </div>
  );
}

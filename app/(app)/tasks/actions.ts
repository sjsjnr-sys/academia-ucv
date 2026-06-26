'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { TaskPriority, TaskStatus } from '@/types/database'

export async function createTaskAction(prevState: unknown, data: {
  course_id: string | null;
  title: string;
  description: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  due_date: string | null;
}) {
  const { course_id, title, description, priority, status, due_date } = data

  if (!title || title.length < 2 || title.length > 200) {
    return { error: 'El título debe tener entre 2 y 200 caracteres.' }
  }

  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: 'No autorizado.' }
  }

  const { data: newTask, error } = await supabase
    .from('tasks')
    .insert({
      user_id: user.id,
      course_id: course_id || null,
      title,
      description: description || null,
      priority,
      status,
      due_date: due_date || null,
    })
    .select('*, courses:courses(*)')
    .single()

  if (error) {
    return { error: `Error al crear la tarea: ${error.message}` }
  }

  revalidatePath('/tasks')
  revalidatePath('/dashboard')
  return { success: true, data: newTask }
}

export async function updateTaskAction(id: string, data: {
  course_id: string | null;
  title: string;
  description: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  due_date: string | null;
}) {
  const { course_id, title, description, priority, status, due_date } = data

  if (!title || title.length < 2 || title.length > 200) {
    return { error: 'El título debe tener entre 2 y 200 caracteres.' }
  }

  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: 'No autorizado.' }
  }

  const { data: updatedTask, error } = await supabase
    .from('tasks')
    .update({
      course_id: course_id || null,
      title,
      description: description || null,
      priority,
      status,
      due_date: due_date || null,
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select('*, courses:courses(*)')
    .single()

  if (error) {
    return { error: `Error al actualizar la tarea: ${error.message}` }
  }

  revalidatePath('/tasks')
  revalidatePath('/dashboard')
  return { success: true, data: updatedTask }
}

export async function toggleTaskStatusAction(id: string, currentStatus: TaskStatus) {
  const nextStatusMap: Record<TaskStatus, TaskStatus> = {
    'PENDING': 'IN_PROGRESS',
    'IN_PROGRESS': 'COMPLETED',
    'COMPLETED': 'PENDING',
  }
  const nextStatus = nextStatusMap[currentStatus]

  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: 'No autorizado.' }
  }

  const { data: updatedTask, error } = await supabase
    .from('tasks')
    .update({ status: nextStatus })
    .eq('id', id)
    .eq('user_id', user.id)
    .select('*, courses:courses(*)')
    .single()

  if (error) {
    return { error: `Error al actualizar el estado: ${error.message}` }
  }

  revalidatePath('/tasks')
  revalidatePath('/dashboard')
  return { success: true, data: updatedTask }
}

export async function deleteTaskAction(id: string) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: 'No autorizado.' }
  }

  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return { error: `Error al eliminar la tarea: ${error.message}` }
  }

  revalidatePath('/tasks')
  revalidatePath('/dashboard')
  return { success: true }
}
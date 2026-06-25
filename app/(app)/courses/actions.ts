'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { Course } from '@/types/database'

// Definimos la estructura estricta reemplazando 'any' por 'Course'
type ActionResponse =
  | { success: true; data: Course }
  | { error: string }
  | null

export async function createCourseAction(prevState: ActionResponse, formData: FormData): Promise<ActionResponse> {
  const name = formData.get('name') as string
  const code = formData.get('code') as string
  const color = formData.get('color') as string

  if (!name || name.length < 2 || name.length > 100) {
    return { error: 'El nombre debe tener entre 2 y 100 caracteres.' }
  }
  if (!code || code.length < 2 || code.length > 20) {
    return { error: 'El código debe tener entre 2 y 20 caracteres.' }
  }
  if (!color || !/^#[0-9A-Fa-f]{6}$/.test(color)) {
    return { error: 'El color seleccionado no es válido.' }
  }

  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: 'No autorizado. Por favor, inicia sesión.' }
  }

  const { data, error } = await supabase
    .from('courses')
    .insert({
      user_id: user.id,
      name,
      code: code.toUpperCase(),
      color,
    })
    .select()
    .single()

  if (error) {
    if (error.code === '23505') {
      return { error: 'Ya tienes un curso registrado con este mismo código.' }
    }
    return { error: `Error al crear el curso: ${error.message}` }
  }

  revalidatePath('/courses')
  revalidatePath('/tasks')
  revalidatePath('/dashboard')
  return { success: true, data: data as Course }
}

export async function updateCourseAction(id: string, formData: FormData): Promise<ActionResponse> {
  const name = formData.get('name') as string
  const code = formData.get('code') as string
  const color = formData.get('color') as string

  if (!name || name.length < 2 || name.length > 100) {
    return { error: 'El nombre debe tener entre 2 y 100 caracteres.' }
  }
  if (!code || code.length < 2 || code.length > 20) {
    return { error: 'El código debe tener entre 2 y 20 caracteres.' }
  }
  if (!color || !/^#[0-9A-Fa-f]{6}$/.test(color)) {
    return { error: 'El color seleccionado no es válido.' }
  }

  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: 'No autorizado.' }
  }

  const { data, error } = await supabase
    .from('courses')
    .update({
      name,
      code: code.toUpperCase(),
      color,
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    if (error.code === '23505') {
      return { error: 'Ya tienes un curso registrado con este mismo código.' }
    }
    return { error: `Error al actualizar el curso: ${error.message}` }
  }

  revalidatePath('/courses')
  revalidatePath('/tasks')
  revalidatePath('/dashboard')
  return { success: true, data: data as Course }
}

export async function deleteCourseAction(id: string): Promise<{ success: true } | { error: string }> {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: 'No autorizado.' }
  }

  const { error } = await supabase
    .from('courses')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return { error: `Error al eliminar el curso: ${error.message}` }
  }

  revalidatePath('/courses')
  revalidatePath('/tasks')
  revalidatePath('/dashboard')
  return { success: true }
}
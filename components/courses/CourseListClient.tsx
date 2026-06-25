'use client'

import { useOptimistic, useState } from 'react'
import { Course } from '@/types/database'
import { COURSE_COLOR_PRESETS } from '@/lib/course-colors'
import { createCourseAction, updateCourseAction, deleteCourseAction } from '@/app/(app)/courses/actions'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Plus, Pencil, Trash2, BookOpen } from 'lucide-react'
import { toast } from 'sonner'

export function CourseListClient({ initialCourses }: { initialCourses: Course[] }) {
  const [coursesState, setCoursesState] = useState<Course[]>(initialCourses)

  // useOptimistic for immediate UI feedback
  const [optimisticCourses, setOptimisticCourses] = useOptimistic(
    coursesState,
    (state, action: { type: 'create' | 'update' | 'delete'; data: any }) => {
      switch (action.type) {
        case 'create':
          return [...state, action.data].sort((a, b) => a.name.localeCompare(b.name))
        case 'update':
          return state.map(c => (c.id === action.data.id ? { ...c, ...action.data } : c)).sort((a, b) => a.name.localeCompare(b.name))
        case 'delete':
          return state.filter(c => c.id !== action.data.id)
        default:
          return state
      }
    }
  )

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [editingCourse, setEditingCourse] = useState<Course | null>(null)

  // Form states
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [color, setColor] = useState(COURSE_COLOR_PRESETS[0].value)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const openCreateDialog = () => {
    setName('')
    setCode('')
    setColor(COURSE_COLOR_PRESETS[0].value)
    setIsCreateOpen(true)
  }

  const openEditDialog = (course: Course) => {
    setEditingCourse(course)
    setName(course.name)
    setCode(course.code)
    setColor(course.color)
    setIsEditOpen(true)
  }

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!name.trim() || !code.trim()) {
      toast.error('Por favor, completa todos los campos obligatorios.')
      return
    }

    setIsSubmitting(true)
    const formData = new FormData()
    formData.append('name', name)
    formData.append('code', code)
    formData.append('color', color)

    // Generate temporary ID for optimistic UI
    const optimisticId = `temp-${Date.now()}`
    const newCourseTemp: Course = {
      id: optimisticId,
      user_id: 'temp',
      name,
      code: code.toUpperCase(),
      color,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    // Set optimistic state & close modal
    setOptimisticCourses({ type: 'create', data: newCourseTemp })
    setIsCreateOpen(false)

    try {
      const result = await createCourseAction(null, formData)
      if (result.error) {
        toast.error(result.error)
      } else if (result.success && result.data) {
        toast.success(`Curso "${name}" creado exitosamente.`)
        setCoursesState(prev => [...prev, result.data as Course].sort((a, b) => a.name.localeCompare(b.name)))
      }
    } catch (error) {
      toast.error('Ocurrió un error inesperado al crear el curso.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!editingCourse) return
    if (!name.trim() || !code.trim()) {
      toast.error('Por favor, completa todos los campos obligatorios.')
      return
    }

    setIsSubmitting(true)
    const formData = new FormData()
    formData.append('name', name)
    formData.append('code', code)
    formData.append('color', color)

    const updatedTemp: Course = {
      ...editingCourse,
      name,
      code: code.toUpperCase(),
      color,
      updated_at: new Date().toISOString(),
    }

    setOptimisticCourses({ type: 'update', data: updatedTemp })
    setIsEditOpen(false)

    try {
      const result = await updateCourseAction(editingCourse.id, formData)
      if (result.error) {
        toast.error(result.error)
      } else if (result.success && result.data) {
        toast.success(`Curso "${name}" actualizado.`)
        setCoursesState(prev => prev.map(c => (c.id === editingCourse.id ? (result.data as Course) : c)).sort((a, b) => a.name.localeCompare(b.name)))
      }
    } catch (error) {
      toast.error('Ocurrió un error inesperado al actualizar el curso.')
    } finally {
      setIsSubmitting(false)
      setEditingCourse(null)
    }
  }

  const handleDelete = async () => {
    if (!deletingId) return

    setOptimisticCourses({ type: 'delete', data: { id: deletingId } })
    const targetId = deletingId
    setDeletingId(null)

    try {
      const result = await deleteCourseAction(targetId)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Curso eliminado correctamente.')
        setCoursesState(prev => prev.filter(c => c.id !== targetId))
      }
    } catch (error) {
      toast.error('Ocurrió un error inesperado al eliminar el curso.')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={openCreateDialog} className="bg-primary hover:bg-primary-600 text-white gap-2 font-medium">
          <Plus className="w-4 h-4" /> Nuevo Curso
        </Button>
      </div>

      {optimisticCourses.length === 0 ? (
        <Card className="p-12 text-center border-dashed border-border-default flex flex-col items-center justify-center">
          <div className="w-12 h-12 bg-bg-sunken rounded-lg flex items-center justify-center mb-4 text-text-tertiary">
            <BookOpen className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-semibold text-text-primary mb-1">No hay cursos registrados</h3>
          <p className="text-sm text-text-secondary max-w-sm mb-6">
            Agrega tu primer asignatura para comenzar a organizar tus entregables académicos.
          </p>
          <Button onClick={openCreateDialog} variant="outline" className="gap-2">
            <Plus className="w-4 h-4" /> Agregar Curso
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {optimisticCourses.map(course => (
            <Card key={course.id} className="p-6 relative overflow-hidden group hover:border-border-strong transition-all flex flex-col justify-between">
              {/* Colored left bar */}
              <div className="absolute left-0 top-0 bottom-0 w-1.5" style={{ backgroundColor: course.color }} />

              <div className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider bg-bg-sunken text-text-secondary border-border-default">
                      {course.code}
                    </span>
                    <h3 className="font-display text-xl font-bold text-text-primary mt-2 group-hover:text-primary transition-colors line-clamp-2">
                      {course.name}
                    </h3>
                  </div>
                </div>
              </div>

              <div className="flex justify-end items-center gap-2 mt-6 pt-4 border-t border-border-subtle">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openEditDialog(course)}
                  className="h-8 px-3 text-text-secondary border-border-default hover:text-text-primary"
                >
                  <Pencil className="w-3.5 h-3.5 mr-1.5" /> Editar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDeletingId(course.id)}
                  className="h-8 px-3 text-error border-border-default hover:bg-error-bg hover:border-error hover:text-error"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Eliminar
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="bg-bg-elevated border-border-default sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-display text-text-primary">Registrar Nuevo Curso</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-5 pt-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-xs font-semibold text-text-secondary uppercase">
                Nombre del Curso
              </Label>
              <Input
                id="name"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Ej. Investigación Avanzada"
                required
                className="bg-bg-sunken border-border-default text-text-primary focus-visible:ring-primary/20"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="code" className="text-xs font-semibold text-text-secondary uppercase">
                Código / Siglas
              </Label>
              <Input
                id="code"
                value={code}
                onChange={e => setCode(e.target.value)}
                placeholder="Ej. IA-101"
                required
                className="bg-bg-sunken border-border-default text-text-primary focus-visible:ring-primary/20"
              />
            </div>

            <div className="space-y-3">
              <Label className="text-xs font-semibold text-text-secondary uppercase">Color Identificador</Label>
              <div className="grid grid-cols-4 gap-2.5">
                {COURSE_COLOR_PRESETS.map(preset => (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => setColor(preset.value)}
                    className="h-8 flex items-center justify-center rounded-md border border-border-subtle hover:border-border-strong relative transition-all"
                    style={{ backgroundColor: preset.value + '10' }} // Light version of color as bg
                  >
                    <span className="w-4 h-4 rounded-full" style={{ backgroundColor: preset.value }} />
                    {color === preset.value && (
                      <span className="absolute inset-0 border-2 border-primary rounded-md pointer-events-none" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <DialogFooter className="pt-4 border-t border-border-subtle">
              <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting} className="bg-primary hover:bg-primary-600 text-white">
                {isSubmitting ? 'Guardando...' : 'Crear Curso'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="bg-bg-elevated border-border-default sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-display text-text-primary">Editar Curso</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-5 pt-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name" className="text-xs font-semibold text-text-secondary uppercase">
                Nombre del Curso
              </Label>
              <Input
                id="edit-name"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Ej. Investigación Avanzada"
                required
                className="bg-bg-sunken border-border-default text-text-primary focus-visible:ring-primary/20"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-code" className="text-xs font-semibold text-text-secondary uppercase">
                Código / Siglas
              </Label>
              <Input
                id="edit-code"
                value={code}
                onChange={e => setCode(e.target.value)}
                placeholder="Ej. IA-101"
                required
                className="bg-bg-sunken border-border-default text-text-primary focus-visible:ring-primary/20"
              />
            </div>

            <div className="space-y-3">
              <Label className="text-xs font-semibold text-text-secondary uppercase">Color Identificador</Label>
              <div className="grid grid-cols-4 gap-2.5">
                {COURSE_COLOR_PRESETS.map(preset => (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => setColor(preset.value)}
                    className="h-8 flex items-center justify-center rounded-md border border-border-subtle hover:border-border-strong relative transition-all"
                    style={{ backgroundColor: preset.value + '10' }}
                  >
                    <span className="w-4 h-4 rounded-full" style={{ backgroundColor: preset.value }} />
                    {color === preset.value && (
                      <span className="absolute inset-0 border-2 border-primary rounded-md pointer-events-none" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <DialogFooter className="pt-4 border-t border-border-subtle">
              <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting} className="bg-primary hover:bg-primary-600 text-white">
                {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Alert */}
      <AlertDialog open={!!deletingId} onOpenChange={open => !open && setDeletingId(null)}>
        <AlertDialogContent className="bg-bg-elevated border-border-default">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-display text-text-primary">¿Estás completamente seguro?</AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-text-secondary leading-relaxed">
              Esta acción no se puede deshacer. Las tareas asociadas a este curso no se eliminarán, pero perderán su vinculación (quedarán sin curso asignado).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border-default text-text-secondary">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-error hover:bg-error-600 text-white">
              Sí, eliminar curso
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

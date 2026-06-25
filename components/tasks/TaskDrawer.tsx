'use client'

import React, { useEffect, useState } from 'react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CalendarDays, AlignLeft, Tag, Circle, BookOpen, Trash2 } from "lucide-react"
import { Task, Course, TaskPriority, TaskStatus } from "@/types/database"

interface TaskDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  task: Task | null // if null, creation mode
  courses: Course[]
  onSave: (data: {
    course_id: string | null
    title: string
    description: string | null
    priority: TaskPriority
    status: TaskStatus
    due_date: string | null
  }) => Promise<void>
  onDelete?: (id: string) => Promise<void>
}

export function TaskDrawer({ open, onOpenChange, task, courses, onSave, onDelete }: TaskDrawerProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [priority, setPriority] = useState<TaskPriority>("medium")
  const [status, setStatus] = useState<TaskStatus>("pending")
  const [dueDate, setDueDate] = useState("")
  const [courseId, setCourseId] = useState<string>("none")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Sync form state when task or open changes
  useEffect(() => {
    if (task) {
      setTitle(task.title || "")
      setDescription(task.description || "")
      setPriority(task.priority || "medium")
      setStatus(task.status || "pending")
      setDueDate(task.due_date || "")
      setCourseId(task.course_id || "none")
    } else {
      setTitle("")
      setDescription("")
      setPriority("medium")
      setStatus("pending")
      setDueDate("")
      setCourseId("none")
    }
  }, [task, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    setIsSubmitting(true)
    try {
      await onSave({
        title,
        description: description.trim() || null,
        priority,
        status,
        due_date: dueDate || null,
        course_id: courseId === "none" ? null : courseId,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (task && onDelete) {
      setIsSubmitting(true)
      try {
        await onDelete(task.id)
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  // Selected course details for preview
  const selectedCourse = courses.find(c => c.id === courseId)

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md w-full bg-bg-elevated border-border-default overflow-y-auto flex flex-col h-full p-6">
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col justify-between">
          <div className="space-y-6">
            <SheetHeader className="space-y-4">
              <div className="flex items-center justify-between">
                <SheetTitle className="text-2xl font-display text-text-primary">
                  {task ? "Editar Tarea" : "Nueva Tarea"}
                </SheetTitle>
                {task && onDelete && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={handleDelete}
                    disabled={isSubmitting}
                    className="h-8 w-8 text-error border-border-default hover:bg-error-bg hover:border-error hover:text-error"
                    title="Eliminar tarea"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
              <SheetDescription className="text-xs text-text-secondary">
                {task ? "Modifica los detalles de tu entregable académico." : "Registra un entregable académico asignando curso, prioridad y fecha límite."}
              </SheetDescription>
            </SheetHeader>

            <div className="space-y-4">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="task-title" className="text-xs font-semibold text-text-secondary uppercase">
                  Título de la Tarea
                </Label>
                <Input
                  id="task-title"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Ej. Revisión de Marco Teórico"
                  required
                  disabled={isSubmitting}
                  className="bg-bg-sunken border-border-default text-text-primary focus-visible:ring-primary/20"
                />
              </div>

              {/* Course Selector */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-text-secondary uppercase flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5" /> Curso
                </Label>
                <Select value={courseId} onValueChange={setCourseId} disabled={isSubmitting}>
                  <SelectTrigger className="w-full bg-bg-sunken border-border-default text-text-primary">
                    <SelectValue placeholder="Selecciona un curso" />
                  </SelectTrigger>
                  <SelectContent className="bg-bg-elevated border-border-default">
                    <SelectItem value="none">Sin Curso</SelectItem>
                    {courses.map(course => (
                      <SelectItem key={course.id} value={course.id}>
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: course.color }} />
                          <span>{course.name} ({course.code})</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Priority & Status */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-text-secondary uppercase flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5" /> Prioridad
                  </Label>
                  <Select value={priority} onValueChange={val => setPriority(val as TaskPriority)} disabled={isSubmitting}>
                    <SelectTrigger className="w-full bg-bg-sunken border-border-default text-text-primary">
                      <SelectValue placeholder="Prioridad" />
                    </SelectTrigger>
                    <SelectContent className="bg-bg-elevated border-border-default">
                      <SelectItem value="low">
                        <span className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-priority-low" /> Baja
                        </span>
                      </SelectItem>
                      <SelectItem value="medium">
                        <span className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-priority-medium" /> Media
                        </span>
                      </SelectItem>
                      <SelectItem value="high">
                        <span className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-priority-high" /> Alta
                        </span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-text-secondary uppercase flex items-center gap-1.5">
                    <Circle className="w-3.5 h-3.5" /> Estado
                  </Label>
                  <Select value={status} onValueChange={val => setStatus(val as TaskStatus)} disabled={isSubmitting}>
                    <SelectTrigger className="w-full bg-bg-sunken border-border-default text-text-primary">
                      <SelectValue placeholder="Estado" />
                    </SelectTrigger>
                    <SelectContent className="bg-bg-elevated border-border-default">
                      <SelectItem value="pending">Pendiente</SelectItem>
                      <SelectItem value="in_progress">En progreso</SelectItem>
                      <SelectItem value="completed">Completada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Due Date */}
              <div className="space-y-2">
                <Label htmlFor="task-due-date" className="text-xs font-semibold text-text-secondary uppercase flex items-center gap-1.5">
                  <CalendarDays className="w-3.5 h-3.5" /> Fecha Límite
                </Label>
                <Input
                  id="task-due-date"
                  type="date"
                  value={dueDate}
                  onChange={e => setDueDate(e.target.value)}
                  disabled={isSubmitting}
                  className="bg-bg-sunken border-border-default text-text-primary focus-visible:ring-primary/20 block"
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="task-description" className="text-xs font-semibold text-text-secondary uppercase flex items-center gap-1.5">
                  <AlignLeft className="w-3.5 h-3.5" /> Descripción
                </Label>
                <textarea
                  id="task-description"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Detalles de la entrega, enlaces a lecturas, rúbrica..."
                  disabled={isSubmitting}
                  className="w-full min-h-[120px] p-3 rounded-md bg-bg-sunken border border-border-default text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 text-sm resize-y leading-relaxed"
                />
              </div>
            </div>
          </div>

          <SheetFooter className="mt-8 pt-4 border-t border-border-subtle flex flex-col sm:flex-row gap-3">
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              onClick={() => onOpenChange(false)}
              className="w-full sm:w-auto"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !title.trim()}
              className="bg-primary hover:bg-primary-600 text-white w-full sm:w-auto"
            >
              {isSubmitting ? "Guardando..." : "Guardar Tarea"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}

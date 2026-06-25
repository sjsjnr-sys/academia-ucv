'use client'

import { useOptimistic, useState } from 'react'
import { Task, Course, TaskPriority, TaskStatus } from '@/types/database'
import { createTaskAction, updateTaskAction, deleteTaskAction, toggleTaskStatusAction } from '@/app/(app)/tasks/actions'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { TaskDrawer } from '@/components/tasks/TaskDrawer'
import {
  Clock,
  CheckCircle2,
  Plus,
  Search,
  BookOpen,
  Tag,
  Circle,
  CheckSquare,
  ChevronRight,
} from 'lucide-react'
import { toast } from 'sonner'

// Tipo estricto para la acción optimista, evitando el uso de 'any'
type OptimisticTaskAction =
  | { type: 'create' | 'update'; data: Task }
  | { type: 'toggle'; data: { id: string } }
  | { type: 'delete'; data: { id: string } }

export function TaskListClient({ initialTasks, courses }: { initialTasks: Task[]; courses: Course[] }) {
  const [tasksState, setTasksState] = useState<Task[]>(initialTasks)

  // useOptimistic for immediate UI feedback on task operations
  const [optimisticTasks, setOptimisticTasks] = useOptimistic(
    tasksState,
    (state, action: OptimisticTaskAction) => {
      switch (action.type) {
        case 'create':
          return [action.data, ...state]
        case 'update':
          return state.map(t => (t.id === action.data.id ? { ...t, ...action.data } : t))
        case 'toggle': {
          const nextStatusMap: Record<TaskStatus, TaskStatus> = {
            'pending': 'in_progress',
            'in_progress': 'completed',
            'completed': 'pending',
          }
          return state.map(t => (t.id === action.data.id ? { ...t, status: nextStatusMap[t.status] } : t))
        }
        case 'delete':
          return state.filter(t => t.id !== action.data.id)
        default:
          return state
      }
    }
  )

  // Filters State
  const [searchQuery, setSearchQuery] = useState('')
  const [courseFilter, setCourseFilter] = useState<string | null>('all')
  const [priorityFilter, setPriorityFilter] = useState<string | null>('all')
  const [statusFilter, setStatusFilter] = useState<string | null>('all')

  // Drawer States
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)

  // Handler: Open Drawer for Create
  const handleOpenCreate = () => {
    setSelectedTask(null)
    setDrawerOpen(true)
  }

  // Handler: Open Drawer for Edit
  const handleOpenEdit = (task: Task) => {
    setSelectedTask(task)
    setDrawerOpen(true)
  }

  // Action: Save Task (Create or Update)
  const handleSaveTask = async (data: {
    course_id: string | null
    title: string
    description: string | null
    priority: TaskPriority
    status: TaskStatus
    due_date: string | null
  }) => {
    setDrawerOpen(false)

    // Find course object for optimistic rendering
    const selectedCourseObj = courses.find(c => c.id === data.course_id) || null

    if (selectedTask) {
      // Edit mode
      const updatedTemp: Task = {
        ...selectedTask,
        ...data,
        courses: selectedCourseObj,
        updated_at: new Date().toISOString(),
      }

      setOptimisticTasks({ type: 'update', data: updatedTemp })

      try {
        const result = await updateTaskAction(selectedTask.id, data)
        if (!result) {
          toast.error('No se recibió respuesta del servidor.')
          return
        }
        if ('error' in result && result.error) {
          toast.error(result.error)
        } else if ('success' in result && result.success && result.data) {
          toast.success('Tarea actualizada.')
          setTasksState(prev => prev.map(t => (t.id === selectedTask.id ? (result.data as Task) : t)))
        }
      } catch {
        toast.error('Error al guardar la tarea.')
      }
    } else {
      // Create mode
      const optimisticId = `temp-${Date.now()}`
      const newTemp: Task = {
        id: optimisticId,
        user_id: 'temp',
        ...data,
        courses: selectedCourseObj,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      setOptimisticTasks({ type: 'create', data: newTemp })

      try {
        const result = await createTaskAction(null, data)
        if (!result) {
          toast.error('No se recibió respuesta del servidor.')
          return
        }
        if ('error' in result && result.error) {
          toast.error(result.error)
        } else if ('success' in result && result.success && result.data) {
          toast.success('Tarea creada correctamente.')
          setTasksState(prev => [result.data as Task, ...prev])
        }
      } catch {
        toast.error('Error al crear la tarea.')
      }
    }
  }

  // Action: Delete Task
  const handleDeleteTask = async (id: string) => {
    setDrawerOpen(false)
    setOptimisticTasks({ type: 'delete', data: { id } })

    try {
      const result = await deleteTaskAction(id)
      if (!result) {
        toast.error('No se recibió respuesta del servidor.')
        return
      }
      if ('error' in result && result.error) {
        toast.error(result.error)
      } else {
        toast.success('Tarea java eliminada.')
        setTasksState(prev => prev.filter(t => t.id !== id))
      }
    } catch {
      toast.error('Error al eliminar la tarea.')
    }
  }

  // Action: Fast Toggle Status
  const handleToggleStatus = async (task: Task, e: React.MouseEvent) => {
    e.stopPropagation() // Prevent opening drawer
    setOptimisticTasks({ type: 'toggle', data: { id: task.id } })

    try {
      const result = await toggleTaskStatusAction(task.id, task.status)
      if (!result) {
        toast.error('No se recibió respuesta del servidor.')
        return
      }
      if ('error' in result && result.error) {
        toast.error(result.error)
      } else if ('success' in result && result.success && result.data) {
        setTasksState(prev => prev.map(t => (t.id === task.id ? (result.data as Task) : t)))
      }
    } catch {
      toast.error('Error al actualizar el estado de la tarea.')
    }
  }

  // Date Formatter
  const formatDueDate = (dateStr: string | null) => {
    if (!dateStr) return 'Sin fecha'
    const [year, month, day] = dateStr.split('-').map(Number)
    const dateVal = new Date(year, month - 1, day)

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const dateCompare = new Date(dateVal)
    dateCompare.setHours(0, 0, 0, 0)

    if (dateCompare.getTime() === today.getTime()) {
      return 'Hoy'
    } else if (dateCompare.getTime() === tomorrow.getTime()) {
      return 'Mañana'
    } else {
      return dateVal.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
    }
  }

  // Filter & Sort Logic
  const filteredTasks = optimisticTasks.filter(task => {
    // Search Query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      const matchesTitle = task.title.toLowerCase().includes(query)
      const matchesDesc = task.description?.toLowerCase().includes(query) || false
      if (!matchesTitle && !matchesDesc) return false
    }

    // Course Filter
    if (courseFilter !== 'all') {
      if (courseFilter === 'none') {
        if (task.course_id !== null) return false
      } else {
        if (task.course_id !== courseFilter) return false
      }
    }

    // Priority Filter
    if (priorityFilter !== 'all' && task.priority !== priorityFilter) {
      return false
    }

    // Status Filter
    if (statusFilter !== 'all' && task.status !== statusFilter) {
      return false
    }

    return true
  })

  // Sort: completed tasks at the bottom, pending/in_progress on top. Then by due date (nulls at the end)
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (a.status === 'completed' && b.status !== 'completed') return 1
    if (a.status !== 'completed' && b.status === 'completed') return -1

    if (!a.due_date && b.due_date) return 1
    if (a.due_date && !b.due_date) return -1
    if (!a.due_date && !b.due_date) return 0

    return a.due_date!.localeCompare(b.due_date!)
  })

  // Priority Styles mapping
  const priorityStyles: Record<TaskPriority, string> = {
    high: 'bg-priority-high-bg text-priority-high border-priority-high-border',
    medium: 'bg-priority-medium-bg text-priority-medium border-priority-medium-border',
    low: 'bg-priority-low-bg text-priority-low border-priority-low-border',
  }

  // Status Styles mapping
  const statusStyles: Record<TaskStatus, string> = {
    pending: 'bg-neutral-100 text-text-secondary border-border-default dark:bg-neutral-800 dark:text-text-secondary',
    in_progress: 'bg-info-bg text-info border-info/20',
    completed: 'bg-success-bg text-success border-success/20',
  }

  const statusLabels: Record<TaskStatus, string> = {
    pending: 'Pendiente',
    in_progress: 'En progreso',
    completed: 'Completada',
  }

  return (
    <div className="space-y-6">
      {/* Header action */}
      <div className="flex justify-end">
        <Button onClick={handleOpenCreate} className="bg-primary hover:bg-primary-600 text-white gap-2 font-medium">
          <Plus className="w-4 h-4" /> Nueva Tarea
        </Button>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative w-full group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary w-4 h-4 group-focus-within:text-primary transition-colors" />
            <Input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 bg-bg-elevated border-border-default focus-visible:ring-primary/20 text-sm"
              placeholder="Buscar tareas..."
            />
          </div>

          {/* Course Filter */}
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-text-tertiary shrink-0" />
            <Select value={courseFilter} onValueChange={(val) => { if (val !== null) setCourseFilter(val) }}>
              <SelectTrigger className="w-full bg-bg-elevated border-border-default text-text-primary text-sm h-9">
                <SelectValue placeholder="Curso" />
              </SelectTrigger>
              <SelectContent className="bg-bg-elevated border-border-default">
                <SelectItem value="all">Todos los Cursos</SelectItem>
                <SelectItem value="none">Sin Curso</SelectItem>
                {courses.map(c => (
                  <SelectItem key={c.id} value={c.id}>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                      <span className="truncate">{c.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Priority Filter */}
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-text-tertiary shrink-0" />
            <Select value={priorityFilter} onValueChange={(val) => { if (val !== null) setPriorityFilter(val) }}>
              <SelectTrigger className="w-full bg-bg-elevated border-border-default text-text-primary text-sm h-9">
                <SelectValue placeholder="Prioridad" />
              </SelectTrigger>
              <SelectContent className="bg-bg-elevated border-border-default">
                <SelectItem value="all">Todas las prioridades</SelectItem>
                <SelectItem value="high">Alta</SelectItem>
                <SelectItem value="medium">Media</SelectItem>
                <SelectItem value="low">Baja</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Circle className="w-4 h-4 text-text-tertiary shrink-0" />
            <Select value={statusFilter} onValueChange={(val) => { if (val !== null) setStatusFilter(val) }}>
              <SelectTrigger className="w-full bg-bg-elevated border-border-default text-text-primary text-sm h-9">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent className="bg-bg-elevated border-border-default">
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="pending">Pendiente</SelectItem>
                <SelectItem value="in_progress">En progreso</SelectItem>
                <SelectItem value="completed">Completada</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Tasks Card List */}
      <Card className="overflow-hidden border border-border-default">
        {sortedTasks.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center bg-bg-elevated">
            <div className="w-12 h-12 bg-bg-sunken rounded-lg flex items-center justify-center mb-4 text-text-tertiary">
              <CheckSquare className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-text-primary mb-1">No se encontraron tareas</h3>
            <p className="text-sm text-text-secondary max-w-sm">
              Prueba a cambiar tus filtros de búsqueda o registra una nueva tarea para comenzar.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border-subtle bg-bg-elevated">
            {sortedTasks.map(task => {
              const isCompleted = task.status === 'completed'
              const courseColor = task.courses?.color || '#C5C4C1'

              return (
                <div
                  key={task.id}
                  onClick={() => handleOpenEdit(task)}
                  className={`group flex items-center gap-4 px-6 py-4 hover:bg-bg-sunken/50 transition-colors cursor-pointer ${isCompleted ? 'opacity-65' : ''
                    }`}
                >
                  {/* Status Toggle Box */}
                  <button
                    onClick={e => handleToggleStatus(task, e)}
                    className="p-1 rounded-md text-text-tertiary hover:text-primary hover:bg-bg-sunken shrink-0 transition-colors"
                    title={`Marcar como ${isCompleted ? 'Pendiente' : 'Completada'}`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-success" />
                    ) : (
                      <Circle className="w-5 h-5 text-border-strong group-hover:border-primary" />
                    )}
                  </button>

                  {/* Course Left Colored Line */}
                  <div className="w-1 h-8 rounded-full shrink-0" style={{ backgroundColor: courseColor }} />

                  {/* Task details */}
                  <div className="flex-1 min-w-0">
                    <h4 className={`text-sm font-semibold text-text-primary truncate ${isCompleted ? 'line-through' : ''}`}>
                      {task.title}
                    </h4>
                    <p className="text-[10px] font-semibold text-text-tertiary uppercase tracking-wider truncate mt-0.5">
                      {task.courses ? `${task.courses.name} (${task.courses.code})` : 'Sin Curso'}
                    </p>
                  </div>

                  {/* Task metadata */}
                  <div className="flex items-center gap-3 shrink-0">
                    {/* Due date */}
                    {task.due_date && (
                      <span
                        className={`flex items-center gap-1.5 text-xs font-medium ${isCompleted
                          ? 'text-text-tertiary'
                          : task.due_date < new Date().toISOString().split('T')[0]
                            ? 'text-error'
                            : 'text-text-secondary'
                          }`}
                      >
                        <Clock className="w-3.5 h-3.5" />
                        {formatDueDate(task.due_date)}
                      </span>
                    )}

                    {/* Priority Badge */}
                    <Badge
                      variant="outline"
                      className={`hidden sm:inline-flex px-2 py-0.5 text-[10px] font-bold ${priorityStyles[task.priority as TaskPriority]}`}
                    >
                      {task.priority ? task.priority.toUpperCase() : ''}
                    </Badge>

                    {/* Status Badge */}
                    <Badge
                      variant="outline"
                      className={`hidden md:inline-flex px-2 py-0.5 text-[10px] font-bold ${statusStyles[task.status as TaskStatus]}`}
                    >
                      {statusLabels[task.status as TaskStatus]}
                    </Badge>

                    <ChevronRight className="w-4 h-4 text-text-tertiary opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </Card>

      {/* Task form Sheet */}
      <TaskDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        task={selectedTask}
        courses={courses}
        onSave={handleSaveTask}
        onDelete={handleDeleteTask}
      />
    </div>
  )
}
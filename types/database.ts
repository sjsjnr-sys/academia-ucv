export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH';
export type TaskStatus = 'pending' | 'in_progress' | 'completed';

export interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Course {
  id: string;
  user_id: string;
  name: string;
  code: string;
  color: string; // Hex string e.g. '#4F5BF5'
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  user_id: string;
  course_id: string | null;
  title: string;
  description: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  due_date: string | null; // ISO Date string (YYYY-MM-DD)
  created_at: string;
  updated_at: string;
  // Dynamic join field for queries
  courses?: Course | null;
}

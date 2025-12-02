export enum Priority {
  NORMAL = 'Normal',
  URGENT = 'Urgent'
}

export enum Status {
  WAITING = 'Waiting',
  IN_PROGRESS = 'In Progress',
  COMPLETED = 'Completed'
}

export interface Task {
  id: string;
  documentNumber?: string; // New field for Document No / Repair Request No
  dateReceived: string; // ISO String
  department: string;
  building?: string; // New field
  floor?: string; // New field
  title: string;
  details?: string; // New field for detailed description
  assignee: string;
  priority: Priority;
  status: Status;
  dateCompleted?: string | null; // ISO String
  dueDate?: string; // Optional for tracking overdue
  budget?: string; // New field for Budget
}

export interface DashboardStats {
  total: number;
  completed: number;
  pending: number;
  inProgress: number;
  urgent: number;
  overdue: number;
}
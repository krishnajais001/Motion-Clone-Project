export type TaskStatus = 'todo' | 'in-progress' | 'done' | 'blocked';
export type TaskPriority = 'none' | 'low' | 'medium' | 'high' | 'urgent';

export interface Task {
    id: string;
    owner_id: string;
    page_id?: string;
    parent_id?: string;
    title: string;
    description?: string;
    status: TaskStatus;
    priority: TaskPriority;
    due_date?: Date;
    order_index: number;
    created_at: Date;
    updated_at: Date;
}

export interface TaskCreateInput {
    title: string;
    description?: string;
    page_id?: string;
    parent_id?: string;
    status?: TaskStatus;
    priority?: TaskPriority;
    due_date?: string;
}

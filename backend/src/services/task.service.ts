import { supabaseAdmin } from '../config/supabase';
import { Task, TaskCreateInput } from '../domain/task';

export class TaskService {
    static async getTasks(owner_id: string, page_id?: string): Promise<Task[]> {
        let query = supabaseAdmin
            .from('tasks')
            .select('*')
            .eq('owner_id', owner_id)
            .order('order_index', { ascending: true });

        if (page_id) {
            query = query.eq('page_id', page_id);
        }

        const { data, error } = await query;

        if (error) throw error;
        return data as Task[];
    }

    static async createTask(owner_id: string, input: TaskCreateInput): Promise<Task> {
        const { data, error } = await supabaseAdmin
            .from('tasks')
            .insert([{ ...input, owner_id }])
            .select()
            .single();

        if (error) throw error;
        return data as Task;
    }

    static async updateTask(owner_id: string, id: string, patch: Partial<Task>): Promise<Task> {
        const { data, error } = await supabaseAdmin
            .from('tasks')
            .update(patch)
            .eq('id', id)
            .eq('owner_id', owner_id)
            .select()
            .single();

        if (error) throw error;
        return data as Task;
    }

    static async deleteTask(owner_id: string, id: string): Promise<void> {
        const { error } = await supabaseAdmin
            .from('tasks')
            .delete()
            .eq('id', id)
            .eq('owner_id', owner_id);

        if (error) throw error;
    }
}

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as tasksApi from '@/api/tasks';
import type { Task } from '@/lib/services/task.service';

export const useTasks = (page_id?: string) => {
  const queryClient = useQueryClient();

  // Query: Fetch all tasks or for a specific page
  const { 
    data: tasks = [], 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['tasks', page_id || 'all'],
    queryFn: () => tasksApi.fetchTasks(page_id ? { page_id } : undefined),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Mutation: Create task
  const createMutation = useMutation({
    mutationFn: tasksApi.createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  // Mutation: Update task
  const updateMutation = useMutation({
    mutationFn: tasksApi.updateTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  // Mutation: Delete task
  const deleteMutation = useMutation({
    mutationFn: tasksApi.deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  return {
    tasks,
    isLoading,
    error,
    createTask: createMutation.mutateAsync,
    updateTask: updateMutation.mutateAsync,
    deleteTask: deleteMutation.mutateAsync,
    // Provide a way to manually update a task optimistically for better UI feel
    setTaskOptimistic: (_task: Task) => {
        // Here you could implement simpler optimistic update if needed
    }
  };
};

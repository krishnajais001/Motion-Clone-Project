import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectsAPI } from '@/api/projects';
import type { Project } from '@/types';

/**
 * Hook for managing all user projects with TanStack Query.
 */
export function useProjects() {
    const queryClient = useQueryClient();

    // Queries
    const projectsQuery = useQuery({
        queryKey: ['projects'],
        queryFn: projectsAPI.getAll,
        staleTime: 1000 * 60 * 10, // 10 minutes cache
    });

    // Mutations
    const addProjectMutation = useMutation({
        mutationFn: projectsAPI.create,
        onSuccess: () => {
             queryClient.invalidateQueries({ queryKey: ['projects'] });
        }
    });

    const updateProjectMutation = useMutation({
        mutationFn: ({ id, patch }: { id: string; patch: Partial<Project> }) =>
            projectsAPI.update(id, patch),
        onSuccess: () => {
             queryClient.invalidateQueries({ queryKey: ['projects'] });
        }
    });

    const removeProjectMutation = useMutation({
        mutationFn: projectsAPI.delete,
        onSuccess: () => {
             queryClient.invalidateQueries({ queryKey: ['projects'] });
        }
    });

    return {
        projects: projectsQuery.data || [],
        isLoading: projectsQuery.isLoading,
        isError: projectsQuery.isError,
        error: projectsQuery.error,
        
        // Actions
        addProject: addProjectMutation.mutateAsync,
        updateProject: updateProjectMutation.mutateAsync,
        removeProject: removeProjectMutation.mutateAsync,
        
        // Status signals
        isAdding: addProjectMutation.isPending,
        isUpdating: updateProjectMutation.isPending,
        isRemoving: removeProjectMutation.isPending
    };
}

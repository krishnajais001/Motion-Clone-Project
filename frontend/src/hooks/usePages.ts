import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { pagesAPI } from '@/api/pages';
import type { Page } from '@/types';

/**
 * Hook for managing all user pages with TanStack Query.
 */
export function usePages() {
    const queryClient = useQueryClient();

    // Queries
    const pagesQuery = useQuery({
        queryKey: ['pages'],
        queryFn: pagesAPI.getAll,
        staleTime: 1000 * 60 * 5, // 5 minutes cache
    });

    // Mutations
    const addPageMutation = useMutation({
        mutationFn: pagesAPI.create,
        onSuccess: () => {
             // Invalidate and refetch
             queryClient.invalidateQueries({ queryKey: ['pages'] });
        }
    });

    const updatePageMutation = useMutation({
        mutationFn: ({ id, patch }: { id: string; patch: Partial<Page> }) =>
            pagesAPI.update(id, patch),
        onMutate: async ({ id, patch }) => {
            // Optimistic update
            await queryClient.cancelQueries({ queryKey: ['pages'] });
            const previousPages = queryClient.getQueryData<Page[]>(['pages']);
            
            if (previousPages) {
                queryClient.setQueryData<Page[]>(['pages'], (old) => 
                     old?.map((p) => p.id === id ? { ...p, ...patch, updated_at: new Date().toISOString() } : p)
                );
            }
            
            return { previousPages };
        },
        onError: (_err, _vars, context) => {
            if (context?.previousPages) {
                queryClient.setQueryData(['pages'], context.previousPages);
            }
        },
        onSettled: () => {
             queryClient.invalidateQueries({ queryKey: ['pages'] });
        }
    });

    const removePageMutation = useMutation({
        mutationFn: pagesAPI.delete,
        onSuccess: () => {
             queryClient.invalidateQueries({ queryKey: ['pages'] });
        }
    });

    return {
        pages: pagesQuery.data || [],
        isLoading: pagesQuery.isLoading,
        isError: pagesQuery.isError,
        error: pagesQuery.error,
        
        // Actions
        addPage: addPageMutation.mutateAsync,
        updatePage: updatePageMutation.mutateAsync,
        removePage: removePageMutation.mutateAsync,
        
        // Status signals
        isAdding: addPageMutation.isPending,
        isUpdating: updatePageMutation.isPending,
        isRemoving: removePageMutation.isPending
    };
}

/**
 * Hook for a single page.
 */
export function usePage(id: string | null) {
    return useQuery({
        queryKey: ['pages', id],
        queryFn: () => id ? pagesAPI.getById(id) : Promise.reject('No ID'),
        enabled: !!id,
        staleTime: 1000 * 60 * 2, // 2 minutes
    });
}

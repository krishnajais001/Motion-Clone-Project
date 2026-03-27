import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as whiteboardsApi from '@/api/whiteboards';

export const useWhiteboard = () => {
    const queryClient = useQueryClient();

    const {
        data: whiteboards = [],
        isLoading,
        error
    } = useQuery({
        queryKey: ['whiteboards'],
        queryFn: whiteboardsApi.fetchWhiteboards,
        staleTime: 1000 * 60 * 60, // 1 hour per dashboard
    });

    const saveMutation = useMutation({
        mutationFn: whiteboardsApi.saveWhiteboard,
        onSuccess: (savedData) => {
            queryClient.setQueryData(['whiteboards'], [savedData]);
        }
    });

    return {
        whiteboard: whiteboards.length > 0 ? whiteboards[0] : null,
        isLoading,
        error,
        saveWhiteboard: saveMutation.mutateAsync,
        isSaving: saveMutation.isPending,
    };
};

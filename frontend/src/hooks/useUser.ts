import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as authApi from '@/api/auth';

export const useUser = () => {
    const queryClient = useQueryClient();

    const {
        data: user,
        isLoading,
        error
    } = useQuery({
        queryKey: ['user'],
        queryFn: authApi.getCurrentUser,
        staleTime: 1000 * 60 * 30, // 30 minutes
    });

    const updateProfile = useMutation({
        mutationFn: authApi.updateProfile,
        onSuccess: (updatedUser) => {
            queryClient.setQueryData(['user'], updatedUser);
        }
    });

    const updateEmail = useMutation({
        mutationFn: authApi.updateEmail,
        onSuccess: (updatedUser) => {
             // email change usually requires re-verification, 
             // but we can update cache locally if needed
             queryClient.setQueryData(['user'], updatedUser);
        }
    });

    const updatePassword = useMutation({
        mutationFn: authApi.updatePassword,
        onSuccess: (updatedUser) => {
             queryClient.setQueryData(['user'], updatedUser);
        }
    });

    return {
        user,
        isLoading,
        error,
        updateProfile: updateProfile.mutateAsync,
        isUpdatingProfile: updateProfile.isPending,
        updateEmail: updateEmail.mutateAsync,
        isUpdatingEmail: updateEmail.isPending,
        updatePassword: updatePassword.mutateAsync,
        isUpdatingPassword: updatePassword.isPending,
    };
};

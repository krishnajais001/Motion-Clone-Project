import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as studyApi from '@/api/study';

export const useStudy = () => {
    const queryClient = useQueryClient();

    const {
        data: subjects = [],
        isLoading: subjectsLoading
    } = useQuery({
        queryKey: ['study-subjects'],
        queryFn: studyApi.fetchSubjects,
        staleTime: 1000 * 60 * 5, // 5 mins
    });

    const {
        data: sessions = [],
        isLoading: sessionsLoading
    } = useQuery({
        queryKey: ['study-sessions'],
        queryFn: studyApi.fetchSessions,
        staleTime: 1000 * 60 * 5,
    });

    const addSubjectMutation = useMutation({
        mutationFn: studyApi.createSubject,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['study-subjects'] })
    });

    const incrementTimeMutation = useMutation({
        mutationFn: ({ id, duration }: { id: string; duration: number }) => 
            studyApi.incrementTime(id, duration),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['study-subjects'] })
    });

    const deleteSubjectMutation = useMutation({
        mutationFn: studyApi.deleteSubject,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['study-subjects'] })
    });

    const logSessionMutation = useMutation({
        mutationFn: ({ subjectName, duration }: { subjectName: string; duration: number }) => 
            studyApi.logSession(subjectName, duration),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['study-sessions'] })
    });

    return {
        subjects,
        sessions,
        isLoading: subjectsLoading || sessionsLoading,
        addSubject: addSubjectMutation.mutateAsync,
        incrementTime: incrementTimeMutation.mutateAsync,
        deleteSubject: deleteSubjectMutation.mutateAsync,
        logSession: logSessionMutation.mutateAsync
    };
};

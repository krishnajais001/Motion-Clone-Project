import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as eventsApi from '@/api/events';

export const useEvents = (range: { start: string; end: string }) => {
  const queryClient = useQueryClient();

  // Query: Fetch events for the specified range
  const { 
    data: events = [], 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['events', range],
    queryFn: () => eventsApi.fetchEvents(range),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Mutation: Create event
  const createMutation = useMutation({
    mutationFn: eventsApi.createEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });

  // Mutation: Update event
  const updateMutation = useMutation({
    mutationFn: eventsApi.updateEvent,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      // Also invalidate specific event if needed, but usually range query is enough
    },
  });

  // Mutation: Delete event
  const deleteMutation = useMutation({
    mutationFn: eventsApi.deleteEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });

  return {
    events,
    isLoading,
    error,
    createEvent: createMutation.mutateAsync,
    updateEvent: updateMutation.mutateAsync,
    deleteEvent: deleteMutation.mutateAsync,
  };
};

import { supabaseAdmin } from '../config/supabase';
import { Event, EventCreateInput } from '../domain/event';

export class EventService {
    static async getEvents(owner_id: string, start_time: string, end_time: string): Promise<Event[]> {
        const { data, error } = await supabaseAdmin
            .from('events')
            .select('*')
            .eq('owner_id', owner_id)
            .gte('start_time', start_time)
            .lte('end_time', end_time);

        if (error) throw error;
        return data as Event[];
    }

    static async createEvent(owner_id: string, input: EventCreateInput): Promise<Event> {
        const { data, error } = await supabaseAdmin
            .from('events')
            .insert([{ ...input, owner_id }])
            .select()
            .single();

        if (error) throw error;
        return data as Event;
    }

    static async updateEvent(owner_id: string, id: string, patch: Partial<Event>): Promise<Event> {
        const { data, error } = await supabaseAdmin
            .from('events')
            .update(patch)
            .eq('id', id)
            .eq('owner_id', owner_id)
            .select()
            .single();

        if (error) throw error;
        return data as Event;
    }

    static async deleteEvent(owner_id: string, id: string): Promise<void> {
        const { error } = await supabaseAdmin
            .from('events')
            .delete()
            .eq('id', id)
            .eq('owner_id', owner_id);

        if (error) throw error;
    }
}

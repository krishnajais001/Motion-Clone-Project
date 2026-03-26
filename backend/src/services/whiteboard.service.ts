import { supabaseAdmin } from '../config/supabase';

export interface WhiteboardData {
    id?: string;
    owner_id: string;
    title?: string;
    elements: any;
}

export class WhiteboardService {
    /**
     * Fetch all whiteboards for a user
     */
    static async getAllWhiteboards(userId: string) {
        const { data, error } = await supabaseAdmin
            .from('whiteboards')
            .select('*')
            .eq('owner_id', userId)
            .order('updated_at', { ascending: false });

        if (error) throw error;
        return data;
    }

    /**
     * Get a single whiteboard by ID
     */
    static async getWhiteboardById(id: string, userId: string) {
        const { data, error } = await supabaseAdmin
            .from('whiteboards')
            .select('*')
            .eq('id', id)
            .eq('owner_id', userId)
            .single();

        if (error) throw error;
        return data;
    }

    /**
     * Create or Update a whiteboard (Upsert)
     * For simplicity, we'll use a single record for now 
     * or handle multiple based on ID existence.
     */
    static async saveWhiteboard(userId: string, whiteboardData: Partial<WhiteboardData>) {
        const { data, error } = await supabaseAdmin
            .from('whiteboards')
            .upsert({ 
                ...whiteboardData, 
                owner_id: userId,
                updated_at: new Date()
            }, { 
                onConflict: 'id' 
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    /**
     * Delete a whiteboard
     */
    static async deleteWhiteboard(id: string, userId: string) {
        const { error } = await supabaseAdmin
            .from('whiteboards')
            .delete()
            .eq('id', id)
            .eq('owner_id', userId);

        if (error) throw error;
        return true;
    }
}

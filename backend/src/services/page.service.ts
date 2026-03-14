import { supabaseAdmin } from '../config/supabase';

export interface PageData {
    id?: string;
    parent_id?: string | null;
    title?: string;
    emoji_icon?: string | null;
    thumbnail_url?: string | null;
    content?: any;
    owner_id: string;
}

export class PageService {
    /**
     * Fetch all pages for a specific user
     */
    static async getAllPages(userId: string) {
        const { data, error } = await supabaseAdmin
            .from('pages')
            .select('*')
            .eq('owner_id', userId)
            .order('created_at', { ascending: true });

        if (error) throw error;
        return data;
    }

    /**
     * Get a single page by ID, ensuring ownership
     */
    static async getPageById(id: string, userId: string) {
        const { data, error } = await supabaseAdmin
            .from('pages')
            .select('*')
            .eq('id', id)
            .eq('owner_id', userId)
            .single();

        if (error) throw error;
        return data;
    }

    /**
     * Create a new page
     */
    static async createPage(pageData: PageData) {
        const { data, error } = await supabaseAdmin
            .from('pages')
            .insert([pageData])
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    /**
     * Update an existing page
     */
    static async updatePage(id: string, userId: string, patch: Partial<PageData>) {
        const { data, error } = await supabaseAdmin
            .from('pages')
            .update(patch)
            .eq('id', id)
            .eq('owner_id', userId)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    /**
     * Delete a page (will cascade to children in DB)
     */
    static async deletePage(id: string, userId: string) {
        const { error } = await supabaseAdmin
            .from('pages')
            .delete()
            .eq('id', id)
            .eq('owner_id', userId);

        if (error) throw error;
        return true;
    }
}

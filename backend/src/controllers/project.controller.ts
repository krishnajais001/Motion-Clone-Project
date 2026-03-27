import { Request, Response } from 'express';
import { supabaseAdmin } from '../config/supabase';

export class ProjectController {
    async getAll(req: Request, res: Response) {
        console.log('📡 Fetch Projects Request by user:', req.user?.sub);
        try {
            const { data, error } = await supabaseAdmin
                .from('projects')
                .select('*')
                .eq('owner_id', req.user!.sub)
                .order('created_at', { ascending: true });

            if (error) {
                console.error('❌ Supabase Fetch Error:', error.message);
                throw error;
            }
            console.log('✅ Projects Found:', data?.length || 0);
            res.json(data || []);
        } catch (error: any) {
            console.error('❌ Project Fetch Catch Error:', error.message);
            res.status(500).json({ error: error.message });
        }
    }

    async create(req: Request, res: Response) {
        console.log('🏗️ Project Create Request:', req.body, 'by user:', req.user?.sub);
        try {
            const { name, emoji_icon } = req.body;
            const { data, error } = await supabaseAdmin
                .from('projects')
                .insert([{ 
                    name, 
                    emoji_icon: emoji_icon || '📁',
                    owner_id: req.user!.sub 
                }])
                .select()
                .single();

            if (error) {
                console.error('❌ Supabase Insert Error:', error.message);
                throw error;
            }
            console.log('✅ Project Created:', data.id);
            res.status(201).json(data);
        } catch (error: any) {
            console.error('❌ Project Create Catch Error:', error.message);
            res.status(500).json({ error: error.message });
        }
    }

    async update(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const updates = req.body;
            const { data, error } = await supabaseAdmin
                .from('projects')
                .update(updates)
                .eq('id', id)
                .eq('owner_id', req.user!.sub)
                .select()
                .single();

            if (error) throw error;
            res.json(data);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async delete(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { error } = await supabaseAdmin
                .from('projects')
                .delete()
                .eq('id', id)
                .eq('owner_id', req.user!.sub);

            if (error) throw error;
            res.status(204).send();
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }
}

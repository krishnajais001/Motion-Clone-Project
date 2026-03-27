import { supabaseAdmin } from '../config/supabase';

export interface StudySubject {
  id: string;
  owner_id: string;
  name: string;
  time_spent_today: number;
  last_reset_date: string;
  created_at: string;
}

export interface StudySession {
  id: string;
  owner_id: string;
  subject_name: string;
  duration: number;
  timestamp: string;
}

export class StudyService {
  /**
   * Fetch subjects, resetting daily if needed
   */
  static async getSubjects(userId: string): Promise<StudySubject[]> {
    const today = new Date().toISOString().split('T')[0];
    
    // 1. Get raw subjects
    const { data: subjects, error } = await supabaseAdmin
      .from('study_subjects')
      .select('*')
      .eq('owner_id', userId)
      .order('created_at', { ascending: true });

    if (error) throw error;

    // 2. Process resets for many rows if date mismatch
    const subjectsToReset = subjects.filter(s => s.last_reset_date !== today);
    
    if (subjectsToReset.length > 0) {
      // Seal yesterday's study time into history records first
      const historyEntries = subjectsToReset
        .filter(s => s.time_spent_today > 0)
        .map(s => ({
          owner_id: userId,
          subject_name: s.name,
          duration: s.time_spent_today,
          timestamp: s.last_reset_date // Date work was actually performed
        }));

      if (historyEntries.length > 0) {
        await supabaseAdmin.from('study_sessions').insert(historyEntries);
      }

      // Reset subjects in database
      const idsToReset = subjectsToReset.map(s => s.id);
      await supabaseAdmin
        .from('study_subjects')
        .update({ time_spent_today: 0, last_reset_date: today })
        .in('id', idsToReset);
        
      // Return fresh data
      return this.getSubjects(userId);
    }

    return subjects;
  }

  static async createSubject(userId: string, name: string) {
    const { data, error } = await supabaseAdmin
      .from('study_subjects')
      .insert([{ owner_id: userId, name, time_spent_today: 0, last_reset_date: new Date().toISOString().split('T')[0] }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async updateSubjectTime(userId: string, id: string, duration: number) {
    // Increment the daily time spent
    const { data, error } = await supabaseAdmin.rpc('increment_study_time', { 
        subject_id: id, 
        inc_val: duration,
        user_uid: userId 
    });

    // Fallback if RPC doesn't exist yet: manually update
    if (error) {
        const { data: current } = await supabaseAdmin.from('study_subjects').select('time_spent_today').eq('id', id).single();
        const newTime = (current?.time_spent_today || 0) + duration;
        
        const { data: updated, error: updateError } = await supabaseAdmin
            .from('study_subjects')
            .update({ time_spent_today: newTime })
            .eq('id', id)
            .eq('owner_id', userId)
            .select()
            .single();
            
        if (updateError) throw updateError;
        return updated;
    }
    return data;
  }

  static async deleteSubject(userId: string, id: string) {
    const { error } = await supabaseAdmin
      .from('study_subjects')
      .delete()
      .eq('id', id)
      .eq('owner_id', userId);

    if (error) throw error;
    return true;
  }

  static async getSessions(userId: string) {
    const { data, error } = await supabaseAdmin
      .from('study_sessions')
      .select('*')
      .eq('owner_id', userId)
      .order('timestamp', { ascending: false });

    if (error) throw error;
    return data;
  }

  static async logSession(userId: string, subjectName: string, duration: number) {
    const { data, error } = await supabaseAdmin
      .from('study_sessions')
      .insert([{ owner_id: userId, subject_name: subjectName, duration, timestamp: new Date().toISOString() }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}

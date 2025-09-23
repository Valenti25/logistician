import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ProgressUpdate {
  id: string;
  project_id: string;
  update_date: string;
  progress_percentage: number;
  description: string;
  photos_url?: string[];
  updated_by: string;
  created_at: string;
}

export const useProgressUpdates = () => {
  const [progressUpdates, setProgressUpdates] = useState<ProgressUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchProgressUpdates = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('progress_updates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProgressUpdates(data || []);
    } catch (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถโหลดข้อมูลความคืบหน้าได้",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createProgressUpdate = async (updateData: Omit<ProgressUpdate, 'id' | 'created_at'>) => {
    try {
      console.log('Creating progress update:', updateData);
      const { data, error } = await supabase
        .from('progress_updates')
        .insert([updateData])
        .select()
        .single();

      if (error) {
        console.error('Database error:', error);
        throw error;
      }

      console.log('Progress update created:', data);
      setProgressUpdates(prev => [data, ...prev]);
      toast({
        title: "สำเร็จ",
        description: "บันทึกความคืบหน้าเรียบร้อยแล้ว"
      });
      return data;
    } catch (error) {
      console.error('Error in createProgressUpdate:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถบันทึกความคืบหน้าได้",
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateProgressUpdate = async (id: string, updates: Partial<ProgressUpdate>) => {
    try {
      console.log('Updating progress update:', id, updates);
      const { data, error } = await supabase
        .from('progress_updates')
        .update(updates)
        .eq('id', id)
        .select();

      if (error) {
        console.error('Database error:', error);
        throw error;
      }

      console.log('Progress update updated:', data);
      const updatedUpdate = data?.[0];
      setProgressUpdates(prev => prev.map(p => p.id === id ? updatedUpdate : p));
      toast({
        title: "สำเร็จ",
        description: "อัพเดทความคืบหน้าเรียบร้อยแล้ว"
      });
      return updatedUpdate;
    } catch (error) {
      console.error('Error in updateProgressUpdate:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถอัพเดทความคืบหน้าได้",
        variant: "destructive"
      });
      throw error;
    }
  };

  const deleteProgressUpdate = async (id: string) => {
    try {
      console.log('Deleting progress update:', id);
      const { error } = await supabase
        .from('progress_updates')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Database error:', error);
        throw error;
      }

      console.log('Progress update deleted:', id);
      setProgressUpdates(prev => prev.filter(p => p.id !== id));
      toast({
        title: "สำเร็จ",
        description: "ลบรายการอัพเดทเรียบร้อยแล้ว"
      });
    } catch (error) {
      console.error('Error in deleteProgressUpdate:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถลบรายการอัพเดทได้",
        variant: "destructive"
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchProgressUpdates();
  }, []);

  return {
    progressUpdates,
    loading,
    createProgressUpdate,
    updateProgressUpdate,
    deleteProgressUpdate,
    refetch: fetchProgressUpdates
  };
};
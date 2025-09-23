import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface MaterialTracking {
  id: string;
  project_id: string;
  description: string;
  category: string;
  total_quantity: number;
  used_quantity: number;
  remaining_quantity: number | null;
  date_usage: Record<string, number>;
  created_at: string;
  updated_at: string;
}

export const useMaterialTracking = () => {
  const [materialTracking, setMaterialTracking] = useState<MaterialTracking[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchMaterialTracking = async (projectId?: string) => {
    try {
      setLoading(true);
      let query = supabase
        .from('material_tracking')
        .select('*')
        .order('created_at', { ascending: false });

      if (projectId) {
        query = query.eq('project_id', projectId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setMaterialTracking((data || []) as MaterialTracking[]);
    } catch (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถโหลดข้อมูลการติดตามวัสดุได้",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createMaterialTracking = async (trackingData: Omit<MaterialTracking, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('material_tracking')
        .insert(trackingData)
        .select()
        .single();

      if (error) throw error;

      setMaterialTracking(prev => [data as MaterialTracking, ...prev]);
      return data;
    } catch (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถสร้างรายการติดตามวัสดุได้",
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateMaterialTracking = async (id: string, updateData: Partial<MaterialTracking>) => {
    try {
      const { data, error } = await supabase
        .from('material_tracking')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setMaterialTracking(prev => prev.map(item => item.id === id ? data as MaterialTracking : item));
      return data;
    } catch (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถอัพเดทข้อมูลได้",
        variant: "destructive"
      });
      throw error;
    }
  };

  const deleteMaterialTracking = async (id: string) => {
    try {
      const { error } = await supabase
        .from('material_tracking')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setMaterialTracking(prev => prev.filter(item => item.id !== id));
    } catch (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถลบรายการได้",
        variant: "destructive"
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchMaterialTracking();
  }, []);

  return {
    materialTracking,
    loading,
    createMaterialTracking,
    updateMaterialTracking,
    deleteMaterialTracking,
    refetch: fetchMaterialTracking
  };
};
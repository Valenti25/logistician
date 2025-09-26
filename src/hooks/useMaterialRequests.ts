import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { supabase as supabaseClient } from '@/integrations/supabase/client';

export interface MaterialItem {
  id?: string;
  item_name: string;
  quantity: number;
  unit: string;
  request_id?: string;
}

export interface MaterialRequest {
  id: string;
  request_code: string;
  project_id: string;
  requester_name: string;
  request_date: string;
  status: string;
  urgency: string;
  notes?: string;
  images_url?: string[];
  created_at: string;
  updated_at: string;
  material_items?: MaterialItem[];
}

export const useMaterialRequests = () => {
  const [materialRequests, setMaterialRequests] = useState<MaterialRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchMaterialRequests = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('material_requests')
        .select(`
          *,
          material_items (*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMaterialRequests((data || []) as MaterialRequest[]);
    } catch (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถโหลดข้อมูลการเบิกวัสดุได้",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createMaterialRequest = async (
    requestData: {
      project_id: string;
      requester_name: string;
      request_date: string;
      status: string;
      urgency: string;
      notes?: string;
      images_url?: string[];
    },
    items: Omit<MaterialItem, 'id' | 'request_id'>[]
  ) => {
    try {
      // Generate request code using the database function
      const { data: codeData, error: codeError } = await supabase
        .rpc('generate_request_code');

      if (codeError) throw codeError;

      const requestDataWithCode = {
        ...requestData,
        request_code: codeData
      };

      const { data: request, error: requestError } = await supabase
        .from('material_requests')
        .insert(requestDataWithCode)
        .select()
        .single();

      if (requestError) throw requestError;

      const itemsWithRequestId = items.map(item => ({
        ...item,
        request_id: request.id
      }));

      const { data: createdItems, error: itemsError } = await supabase
        .from('material_items')
        .insert(itemsWithRequestId)
        .select();

      if (itemsError) throw itemsError;

      const newRequest = { ...request, material_items: createdItems } as MaterialRequest;
      setMaterialRequests(prev => [newRequest, ...prev]);

      toast({
        title: "สำเร็จ",
        description: "ส่งคำขอเบิกวัสดุเรียบร้อยแล้ว"
      });
      return newRequest;
    } catch (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถส่งคำขอเบิกวัสดุได้",
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateRequestStatus = async (id: string, status: string) => {
    try {
      const { data, error } = await supabase
        .from('material_requests')
        .update({ status })
        .eq('id', id)
        .select(`
          *,
          material_items (*)
        `)
        .single();

      if (error) throw error;

      // When approving, apply consumption into material_tracking
      if (status === 'approved' && data) {
        const items = (data.material_items || []) as MaterialItem[];
        // Fetch current tracking rows for the project
        const { data: tracking, error: trackErr } = await supabaseClient
          .from('material_tracking')
          .select('*')
          .eq('project_id', data.project_id);
        if (trackErr) throw trackErr;

        const trackingMap = new Map<string, any>();
        (tracking || []).forEach(row => trackingMap.set(row.description, row));

        // Apply each item's unit as used amount on the request_date
        for (const item of items) {
          const row = trackingMap.get(item.item_name);
          if (!row) continue; // skip unknown items
          const usedAmount = Number(item.unit || 0);
          if (!usedAmount) continue;

          const newUsed = Number(row.used_quantity || 0) + usedAmount;
          const newRemaining = Number(row.total_quantity || 0) - newUsed;
          const newDateUsage = { ...(row.date_usage || {}) };
          const dateKey = data.request_date;
          newDateUsage[dateKey] = Number(newDateUsage[dateKey] || 0) + usedAmount;

          await supabaseClient
            .from('material_tracking')
            .update({ used_quantity: newUsed, remaining_quantity: newRemaining, date_usage: newDateUsage })
            .eq('id', row.id);
        }
      }

      setMaterialRequests(prev => prev.map(r => r.id === id ? data as MaterialRequest : r));
      toast({
        title: "สำเร็จ",
        description: "อัพเดทสถานะเรียบร้อยแล้ว"
      });
      return data;
    } catch (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถอัพเดทสถานะได้",
        variant: "destructive"
      });
      throw error;
    }
  };

  const deleteRequest = async (id: string) => {
    try {
      console.log('Deleting material request:', id);
      
      // First delete related material_items
      const { error: itemsError } = await supabase
        .from('material_items')
        .delete()
        .eq('request_id', id);

      if (itemsError) {
        console.warn('Error deleting material items:', itemsError);
      }

      // Then delete the request
      const { error } = await supabase
        .from('material_requests')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Database error:', error);
        throw error;
      }

      console.log('Material request deleted:', id);
      setMaterialRequests(prev => prev.filter(r => r.id !== id));
      toast({
        title: "สำเร็จ",
        description: "ลบคำขอเรียบร้อยแล้ว"
      });
    } catch (error) {
      console.error('Error in deleteRequest:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถลบคำขอได้",
        variant: "destructive"
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchMaterialRequests();
  }, []);

  return {
    materialRequests,
    loading,
    createMaterialRequest,
    updateRequestStatus,
    deleteRequest,
    refetch: fetchMaterialRequests
  };
};
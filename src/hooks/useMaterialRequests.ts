import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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

      // Also create material tracking entries for each item
      const trackingItems = items.map(item => ({
        project_id: requestData.project_id,
        description: item.item_name,
        category: "เบิกอุปกรณ์แล้ว",
        total_quantity: item.quantity,
        used_quantity: 0,
        remaining_quantity: item.quantity,
        date_usage: {}
      }));

      const { error: trackingError } = await supabase
        .from('material_tracking')
        .insert(trackingItems);

      if (trackingError) {
        console.warn('Failed to create tracking entries:', trackingError);
      }

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
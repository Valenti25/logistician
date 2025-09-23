import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface TeamMember {
  id: string;
  name: string;
  role?: string;
  specialty?: string;
  phone?: string;
  email?: string;
  projects?: string;
  status?: string;
  experience?: string;
  join_date?: string;
  avatar_url?: string;
  last_update?: string;
}

export const useTeamMembers = () => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchTeamMembers = async () => {
    try {
      setLoading(true);
      console.log('Fetching team members...');
      const { data, error } = await (supabase as any)
        .from('team_members')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        console.error('Database error:', error);
        throw error;
      }

      console.log('Team members fetched:', data);
      setTeamMembers((data || []) as TeamMember[]);
    } catch (error) {
      console.error('Error in fetchTeamMembers:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถโหลดข้อมูลทีมงานได้",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createTeamMember = async (memberData: Omit<TeamMember, 'id'>) => {
    try {
      console.log('Creating team member:', memberData);
      
      // Don't send id field - let database generate it
      const insertData = { ...memberData };
      delete (insertData as any).id;
      
      const { data, error } = await (supabase as any)
        .from('team_members')
        .insert([insertData])
        .select();

      if (error) {
        console.error('Database error:', error);
        throw error;
      }

      console.log('Team member created:', data);
      const newMember = data?.[0] as TeamMember;
      setTeamMembers(prev => [newMember, ...prev]);
      toast({
        title: "สำเร็จ",
        description: "เพิ่มสมาชิกทีมใหม่เรียบร้อยแล้ว"
      });
      return newMember;
    } catch (error) {
      console.error('Error in createTeamMember:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถเพิ่มสมาชิกทีมได้",
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateTeamMember = async (id: string, updates: Partial<TeamMember>) => {
    try {
      console.log('Updating team member:', id, updates);
      const { data, error } = await (supabase as any)
        .from('team_members')
        .update(updates)
        .eq('id', id)
        .select();

      if (error) {
        console.error('Database error:', error);
        throw error;
      }

      console.log('Team member updated:', data);
      const updatedMember = data?.[0] as TeamMember;
      setTeamMembers(prev => prev.map(m => m.id === id ? updatedMember : m));
      toast({
        title: "สำเร็จ",
        description: "อัพเดทข้อมูลสมาชิกเรียบร้อยแล้ว"
      });
      return updatedMember;
    } catch (error) {
      console.error('Error in updateTeamMember:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถอัพเดทข้อมูลสมาชิกได้",
        variant: "destructive"
      });
      throw error;
    }
  };

  const deleteTeamMember = async (id: string) => {
    try {
      const { error } = await (supabase as any)
        .from('team_members')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setTeamMembers(prev => prev.filter(m => m.id !== id));
      toast({
        title: "สำเร็จ",
        description: "ลบสมาชิกเรียบร้อยแล้ว"
      });
    } catch (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถลบสมาชิกได้",
        variant: "destructive"
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  return {
    teamMembers,
    loading,
    createTeamMember,
    updateTeamMember,
    deleteTeamMember,
    refetch: fetchTeamMembers
  };
};
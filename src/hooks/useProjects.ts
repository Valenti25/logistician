import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Project {
  id: string;
  name: string;
  location: string;
  status: string;
  progress: number;
  start_date: string;
  end_date: string;
  team_name: string;
  budget: number;
  description?: string;
  assigned_members?: string[];
  created_at: string;
  updated_at: string;
}

export const useProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProjects((data || []) as Project[]);
    } catch (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถโหลดข้อมูลโครงการได้",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createProject = async (projectData: Omit<Project, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      console.log('Creating project:', projectData);
      
      const { data, error } = await supabase
        .from('projects')
        .insert([projectData])
        .select()
        .single();

      if (error) {
        console.error('Database error:', error);
        throw error;
      }

      console.log('Project created:', data);
      setProjects(prev => [data as Project, ...prev]);
      
      // Update team members' projects field
      if (projectData.assigned_members && projectData.assigned_members.length > 0) {
        for (const memberId of projectData.assigned_members) {
          const { error: updateError } = await supabase
            .from('team_members')
            .update({ 
              projects: projectData.name,
              last_update: new Date().toISOString().split('T')[0]
            })
            .eq('id', memberId);
            
          if (updateError) {
            console.warn(`Failed to update team member ${memberId}:`, updateError);
          }
        }
      }
      
      toast({
        title: "สำเร็จ",
        description: "เพิ่มโครงการใหม่เรียบร้อยแล้ว"
      });
      return data;
    } catch (error) {
      console.error('Error in createProject:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถเพิ่มโครงการได้",
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateProject = async (id: string, updates: Partial<Project>) => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setProjects(prev => prev.map(p => p.id === id ? data as Project : p));
      toast({
        title: "สำเร็จ",
        description: "อัพเดทโครงการเรียบร้อยแล้ว"
      });
      return data;
    } catch (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถอัพเดทโครงการได้",
        variant: "destructive"
      });
      throw error;
    }
  };

  const deleteProject = async (id: string) => {
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setProjects(prev => prev.filter(p => p.id !== id));
      toast({
        title: "สำเร็จ",
        description: "ลบโครงการเรียบร้อยแล้ว"
      });
    } catch (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถลบโครงการได้",
        variant: "destructive"
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return {
    projects,
    loading,
    createProject,
    updateProject,
    deleteProject,
    refetch: fetchProjects
  };
};
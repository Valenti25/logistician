import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus } from "lucide-react";
import { useProjects } from "@/hooks/useProjects";
import { useTeamMembers } from "@/hooks/useTeamMembers";

interface AddProjectDialogProps {
  children?: React.ReactNode;
}

const AddProjectDialog = ({ children }: AddProjectDialogProps) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    description: "",
    status: "pending" as const,
    progress: 0,
    start_date: "",
    end_date: "",
    team_name: "",
    budget: 0,
    assigned_members: [] as string[]
  });
  
  const { createProject } = useProjects();
  const { teamMembers } = useTeamMembers();

  // Filter only active team members for selection
  const activeTeamMembers = teamMembers.filter(member => member.status === "active");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createProject(formData);
      setFormData({
        name: "",
        location: "",
        description: "",
        status: "pending",
        progress: 0,
        start_date: "",
        end_date: "",
        team_name: "",
        budget: 0,
        assigned_members: []
      });
      setOpen(false);
    } catch (error) {
      console.error('Error creating project:', error);
    }
  };

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleMemberToggle = (memberId: string) => {
    setFormData(prev => ({
      ...prev,
      assigned_members: prev.assigned_members.includes(memberId)
        ? prev.assigned_members.filter(id => id !== memberId)
        : [...prev.assigned_members, memberId]
    }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button className="bg-gradient-accent text-accent-foreground shadow-construction">
            <Plus className="mr-2 h-4 w-4" />
            เพิ่มโครงการใหม่
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>เพิ่มโครงการใหม่</DialogTitle>
          <DialogDescription>
            สร้างโครงการใหม่และระบุรายละเอียดต่างๆ
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">ชื่อโครงการ</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => updateFormData("name", e.target.value)}
                placeholder="ระบุชื่อโครงการ"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">สถานที่</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => updateFormData("location", e.target.value)}
                placeholder="ระบุสถานที่"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">รายละเอียด</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => updateFormData("description", e.target.value)}
              placeholder="อธิบายโครงการ..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_date">วันที่เริ่ม</Label>
              <Input
                id="start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) => updateFormData("start_date", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_date">วันที่สิ้นสุด</Label>
              <Input
                id="end_date"
                type="date"
                value={formData.end_date}
                onChange={(e) => updateFormData("end_date", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">สถานะ</Label>
              <Select value={formData.status} onValueChange={(value) => updateFormData("status", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">รอเริ่มงาน</SelectItem>
                  <SelectItem value="active">กำลังดำเนินการ</SelectItem>
                  <SelectItem value="completed">เสร็จสิ้น</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="team_name">ชุดทีมงาน</Label>
              <Select value={formData.team_name} onValueChange={(value) => updateFormData("team_name", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="เลือกพนักงานที่ปฏิบัติงาน" />
                </SelectTrigger>
                <SelectContent>
                  {activeTeamMembers.length === 0 ? (
                    <SelectItem value="" disabled>ไม่มีพนักงานที่ปฏิบัติงาน</SelectItem>
                  ) : (
                    activeTeamMembers.map((member) => (
                      <SelectItem key={member.id} value={member.name}>
                        {member.name} ({member.role || "ไม่ระบุตำแหน่ง"})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="budget">งบประมาณ (บาท)</Label>
              <Input
                id="budget"
                type="number"
                min="0"
                value={formData.budget}
                onChange={(e) => updateFormData("budget", parseInt(e.target.value))}
                required
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              ยกเลิก
            </Button>
            <Button type="submit" className="bg-gradient-primary">
              สร้างโครงการ
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddProjectDialog;
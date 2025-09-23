import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Edit } from "lucide-react";
import { useState, useEffect } from "react";
import { useTeamMembers, TeamMember } from "@/hooks/useTeamMembers";
import { useProjects } from "@/hooks/useProjects";
import ImageUpload from "@/components/ImageUpload";
import { useToast } from "@/hooks/use-toast";

interface EditTeamMemberDialogProps {
  member: TeamMember;
}

const EditTeamMemberDialog = ({ member }: EditTeamMemberDialogProps) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    specialty: "",
    phone: "",
    email: "",
    experience: "",
    projects: "",
    status: "active",
    avatar_url: [] as string[]
  });

  const { updateTeamMember } = useTeamMembers();
  const { projects } = useProjects();
  const { toast } = useToast();

  useEffect(() => {
    if (member) {
      setFormData({
        name: member.name || "",
        role: member.role || "",
        specialty: member.specialty || "",
        phone: member.phone || "",
        email: member.email || "",
        experience: member.experience || "",
        projects: member.projects || "",
        status: member.status || "active",
        avatar_url: member.avatar_url ? [member.avatar_url] : []
      });
    }
  }, [member]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: "กรุณากรอกข้อมูลให้ครบถ้วน",
        description: "ชื่อ-นามสกุล จำเป็นต้องกรอก",
        variant: "destructive"
      });
      return;
    }

    try {
      await updateTeamMember(member.id, {
        ...formData,
        avatar_url: formData.avatar_url.length > 0 ? formData.avatar_url[0] : null,
        last_update: new Date().toISOString().split('T')[0]
      });
      
      setOpen(false);
      toast({
        title: "สำเร็จ",
        description: "อัพเดทข้อมูลสมาชิกเรียบร้อยแล้ว"
      });
    } catch (error) {
      console.error('Error updating team member:', error);
    }
  };

  const handleInputChange = (field: string, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Edit className="mr-1 h-3 w-3" />
          แก้ไข
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>แก้ไขข้อมูลสมาชิกทีม</DialogTitle>
          <DialogDescription>
            อัพเดทข้อมูลสมาชิกทีมงาน
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">ชื่อ-นามสกุล *</Label>
                <Input 
                  id="name"
                  placeholder="ชื่อ นามสกุล" 
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="role">ตำแหน่ง</Label>
                <Select value={formData.role} onValueChange={(value) => handleInputChange('role', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกตำแหน่ง" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="หัวหน้าช่าง">หัวหน้าช่าง</SelectItem>
                    <SelectItem value="หัวหน้าโครงการ">หัวหน้าโครงการ</SelectItem>
                    <SelectItem value="ช่างปูน">ช่างปูน</SelectItem>
                    <SelectItem value="ช่างเหล็ก">ช่างเหล็ก</SelectItem>
                    <SelectItem value="ช่างไฟฟ้า">ช่างไฟฟ้า</SelectItem>
                    <SelectItem value="ช่างประปา">ช่างประปา</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="specialty">ความเชี่ยวชาญ</Label>
                <Input 
                  id="specialty"
                  placeholder="เช่น งานโครงสร้าง, งานก่ออิฐ" 
                  value={formData.specialty}
                  onChange={(e) => handleInputChange('specialty', e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="experience">ประสบการณ์</Label>
                <Input 
                  id="experience"
                  placeholder="เช่น 5 ปี" 
                  value={formData.experience}
                  onChange={(e) => handleInputChange('experience', e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="phone">เบอร์โทรศัพท์</Label>
                <Input 
                  id="phone"
                  placeholder="081-234-5678" 
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">อีเมล</Label>
                <Input 
                  id="email"
                  type="email" 
                  placeholder="example@construction.com" 
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>รูปโปรไฟล์</Label>
              <ImageUpload
                images={formData.avatar_url}
                onImagesChange={(images) => handleInputChange('avatar_url', images)}
                folder="team-avatars"
                maxImages={1}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="projects">โครงการที่รับผิดชอบ</Label>
              <Select value={formData.projects} onValueChange={(value) => handleInputChange('projects', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="เลือกโครงการ" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.name}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="status">สถานะ</Label>
              <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="เลือกสถานะ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">ปฏิบัติงาน</SelectItem>
                  <SelectItem value="on-leave">ลาพัก</SelectItem>
                  <SelectItem value="inactive">ไม่ปฏิบัติงาน</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              ยกเลิก
            </Button>
            <Button type="submit" className="bg-gradient-primary">
              บันทึกการแก้ไข
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditTeamMemberDialog;
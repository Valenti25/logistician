import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { useState } from "react";
import { useProgressUpdates } from "@/hooks/useProgressUpdates";
import { useProjects } from "@/hooks/useProjects";
import ImageUpload from "@/components/ImageUpload";
import { useToast } from "@/hooks/use-toast";

const AddProgressUpdateDialog = () => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    project_id: "",
    description: "",
    progress_percentage: "",
    updated_by: "",
    photos_url: [] as string[]
  });

  const { createProgressUpdate } = useProgressUpdates();
  const { projects } = useProjects();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.project_id || !formData.description || !formData.progress_percentage || !formData.updated_by) {
      toast({
        title: "กรุณากรอกข้อมูลให้ครบถ้วน",
        description: "โครงการ, ผู้อัพเดท, ความคืบหน้า และรายละเอียดงาน จำเป็นต้องกรอก",
        variant: "destructive"
      });
      return;
    }

    try {
      console.log('Submitting progress update:', formData);
      await createProgressUpdate({
        project_id: formData.project_id,
        description: formData.description,
        progress_percentage: parseInt(formData.progress_percentage),
        updated_by: formData.updated_by,
        photos_url: formData.photos_url.length > 0 ? formData.photos_url : [],
        update_date: new Date().toISOString().split('T')[0]
      });
      
      setFormData({
        project_id: "",
        description: "",
        progress_percentage: "",
        updated_by: "",
        photos_url: []
      });
      setOpen(false);
    } catch (error) {
      console.error('Error submitting progress update:', error);
    }
  };

  const handleInputChange = (field: string, value: string | number | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-accent text-accent-foreground shadow-construction">
          <Plus className="mr-2 h-4 w-4" />
          อัพเดทใหม่
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>บันทึกความคืบหน้าใหม่</DialogTitle>
          <DialogDescription>
            อัพเดทความคืบหน้าการทำงานในโครงการ
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="project">โครงการ *</Label>
                <Select value={formData.project_id} onValueChange={(value) => handleInputChange('project_id', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกโครงการ" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="updated_by">ผู้อัพเดท *</Label>
                <Input 
                  id="updated_by"
                  placeholder="ชื่อผู้อัพเดท" 
                  value={formData.updated_by}
                  onChange={(e) => handleInputChange('updated_by', e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="progress_percentage">ความคืบหน้าปัจจุบัน (%) *</Label>
              <Input 
                id="progress_percentage"
                type="number" 
                min="0" 
                max="100"
                placeholder="0-100" 
                value={formData.progress_percentage}
                onChange={(e) => handleInputChange('progress_percentage', e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">รายละเอียดงานที่ทำ *</Label>
              <Textarea 
                id="description"
                placeholder="อธิบายงานที่ทำเสร็จและกำลังดำเนินการ..." 
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label>รูปภาพประกอบ</Label>
              <ImageUpload
                images={formData.photos_url}
                onImagesChange={(images) => handleInputChange('photos_url', images)}
                folder="progress-updates"
                maxImages={5}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              ยกเลิก
            </Button>
            <Button type="submit" className="bg-gradient-primary">
              บันทึกข้อมูล
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddProgressUpdateDialog;
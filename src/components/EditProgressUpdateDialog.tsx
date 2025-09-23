import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Edit } from "lucide-react";
import { useState, useEffect } from "react";
import { useProgressUpdates, ProgressUpdate } from "@/hooks/useProgressUpdates";
import { useProjects } from "@/hooks/useProjects";
import ImageUpload from "@/components/ImageUpload";
import { useToast } from "@/hooks/use-toast";

interface EditProgressUpdateDialogProps {
  update: ProgressUpdate;
}

const EditProgressUpdateDialog = ({ update }: EditProgressUpdateDialogProps) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    project_id: "",
    description: "",
    progress_percentage: "",
    updated_by: "",
    photos_url: [] as string[]
  });

  const { updateProgressUpdate } = useProgressUpdates();
  const { projects } = useProjects();
  const { toast } = useToast();

  useEffect(() => {
    if (update) {
      setFormData({
        project_id: update.project_id,
        description: update.description,
        progress_percentage: update.progress_percentage.toString(),
        updated_by: update.updated_by,
        photos_url: update.photos_url || []
      });
    }
  }, [update]);

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
      console.log('Updating progress update:', formData);
      await updateProgressUpdate(update.id, {
        project_id: formData.project_id,
        description: formData.description,
        progress_percentage: parseInt(formData.progress_percentage),
        updated_by: formData.updated_by,
        photos_url: formData.photos_url.length > 0 ? formData.photos_url : []
      });
      
      setOpen(false);
      toast({
        title: "สำเร็จ",
        description: "อัพเดทข้อมูลความคืบหน้าเรียบร้อยแล้ว"
      });
    } catch (error) {
      console.error('Error updating progress update:', error);
    }
  };

  const handleInputChange = (field: string, value: string | number | string[]) => {
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
          <DialogTitle>แก้ไขข้อมูลความคืบหน้า</DialogTitle>
          <DialogDescription>
            อัพเดทข้อมูลความคืบหน้าการทำงานในโครงการ
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
                rows={4}
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
              บันทึกการแก้ไข
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditProgressUpdateDialog;
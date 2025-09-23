import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, X } from "lucide-react";
import { useMaterialRequests } from "@/hooks/useMaterialRequests";
import { useProjects } from "@/hooks/useProjects";
import ImageUpload from "@/components/ImageUpload";

interface MaterialRequestFormProps {
  children?: React.ReactNode;
}

const MaterialRequestForm = ({ children }: MaterialRequestFormProps) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    project_id: "",
    requester_name: "",
    request_date: new Date().toISOString().split('T')[0],
    status: "pending",
    urgency: "normal",
    notes: "",
    images_url: [] as string[]
  });
  
  const [items, setItems] = useState([
    { item_name: "", quantity: 1, unit: "" }
  ]);
  
  const { createMaterialRequest } = useMaterialRequests();
  const { projects } = useProjects();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validItems = items.filter(item => 
      item.item_name && item.quantity > 0 && item.unit
    );
    
    if (validItems.length === 0) {
      alert("กรุณาเพิ่มรายการวัสดุอย่างน้อย 1 รายการ");
      return;
    }

    try {
      await createMaterialRequest(formData, validItems);
      setFormData({
        project_id: "",
        requester_name: "",
        request_date: new Date().toISOString().split('T')[0],
        status: "pending",
        urgency: "normal",
        notes: "",
        images_url: []
      });
      setItems([{ item_name: "", quantity: 1, unit: "" }]);
      setOpen(false);
    } catch (error) {
      console.error('Error creating material request:', error);
    }
  };

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const updateItem = (index: number, field: string, value: any) => {
    setItems(prev => prev.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    ));
  };

  const addItem = () => {
    setItems(prev => [...prev, { item_name: "", quantity: 1, unit: "" }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(prev => prev.filter((_, i) => i !== index));
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button className="bg-gradient-accent text-accent-foreground shadow-construction">
            <Plus className="mr-2 h-4 w-4" />
            เบิกวัสดุใหม่
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>แบบฟอร์มเบิกวัสดุใหม่</DialogTitle>
          <DialogDescription>
            กรอกรายละเอียดการเบิกวัสดุและอุปกรณ์
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="project">โครงการ</Label>
              <Select value={formData.project_id} onValueChange={(value) => updateFormData("project_id", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="เลือกโครงการ" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map(project => (
                    <SelectItem key={project.id} value={project.id}>{project.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="requester_name">ผู้เบิก</Label>
              <Input
                id="requester_name"
                value={formData.requester_name}
                onChange={(e) => updateFormData("requester_name", e.target.value)}
                placeholder="ชื่อผู้เบิก"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="urgency">ความเร่งด่วน</Label>
              <Select value={formData.urgency} onValueChange={(value) => updateFormData("urgency", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="เลือกระดับ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">ไม่เร่งด่วน</SelectItem>
                  <SelectItem value="normal">ปกติ</SelectItem>
                  <SelectItem value="high">เร่งด่วน</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="request_date">วันที่เบิก</Label>
              <Input
                id="request_date"
                type="date"
                value={formData.request_date}
                onChange={(e) => updateFormData("request_date", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label>รายการวัสดุ</Label>
              <Button type="button" onClick={addItem} size="sm" variant="outline">
                <Plus className="mr-2 h-3 w-3" />
                เพิ่มรายการ
              </Button>
            </div>
            {items.map((item, index) => (
              <div key={index} className="grid grid-cols-12 gap-2 items-end">
                <div className="col-span-5">
                  <Input
                    placeholder="ชื่อวัสดุ"
                    value={item.item_name}
                    onChange={(e) => updateItem(index, "item_name", e.target.value)}
                    required
                  />
                </div>
                <div className="col-span-3">
                  <Input
                    type="number"
                    placeholder="จำนวน"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, "quantity", parseFloat(e.target.value))}
                    required
                  />
                </div>
                <div className="col-span-3">
                  <Input
                    placeholder="หน่วย"
                    value={item.unit}
                    onChange={(e) => updateItem(index, "unit", e.target.value)}
                    required
                  />
                </div>
                <div className="col-span-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeItem(index)}
                    disabled={items.length === 1}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">หมายเหตุ</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => updateFormData("notes", e.target.value)}
              placeholder="รายละเอียดเพิ่มเติม..."
            />
          </div>

          <div className="space-y-2">
            <Label>รูปภาพประกอบ</Label>
            <ImageUpload
              images={formData.images_url}
              onImagesChange={(images) => updateFormData("images_url", images)}
              folder="material-requests"
              maxImages={5}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              ยกเลิก
            </Button>
            <Button type="submit" className="bg-gradient-primary">
              ส่งคำขอ
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default MaterialRequestForm;
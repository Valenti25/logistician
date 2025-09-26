import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import { useMaterialTracking } from "@/hooks/useMaterialTracking";

interface AddMaterialDialogProps {
  projectId: string;
  onAdded?: () => void;
  children?: React.ReactNode;
}

const AddMaterialDialog = ({ projectId, onAdded, children }: AddMaterialDialogProps) => {
  const [open, setOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("วัสดุ");
  const [totalQuantity, setTotalQuantity] = useState<number>(0);
  const [notes, setNotes] = useState("");
  const { createMaterialTracking } = useMaterialTracking();

  const reset = () => {
    setDescription("");
    setCategory("วัสดุ");
    setTotalQuantity(0);
    setNotes("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !projectId || totalQuantity <= 0) return;
    try {
      await createMaterialTracking({
        project_id: projectId,
        description,
        category,
        total_quantity: totalQuantity,
        used_quantity: 0,
        remaining_quantity: totalQuantity,
        date_usage: {},
        created_at: "",
        updated_at: "",
        id: ""
      } as any);
      reset();
      setOpen(false);
      onAdded?.();
    } catch (err) {
      // Error toast handled in hook
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button className="bg-gradient-primary text-white">
            <Plus className="mr-2 h-4 w-4" />
            เพิ่มวัสดุ
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>เพิ่มวัสดุเข้าโครงการ</DialogTitle>
          <DialogDescription>กรอกรายละเอียดวัสดุที่จะบันทึกในโครงการนี้</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="description">ชื่อวัสดุ</Label>
            <Input id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="เช่น เหล็กเส้น RB6" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">หมวดหมู่</Label>
              <Input id="category" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="เช่น โครงสร้าง" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="total">จำนวนทั้งหมด (ชิ้น)</Label>
              <Input id="total" type="number" min="0" value={totalQuantity} onChange={(e) => setTotalQuantity(parseFloat(e.target.value))} required />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">หมายเหตุ</Label>
            <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="รายละเอียดเพิ่มเติม (ถ้ามี)" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>ยกเลิก</Button>
            <Button type="submit" className="bg-gradient-primary">บันทึก</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddMaterialDialog;



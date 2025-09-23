import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Camera, Upload, X, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ImageUploadProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  bucketName?: string;
  folder?: string;
  maxImages?: number;
  className?: string;
}

const ImageUpload = ({ 
  images, 
  onImagesChange, 
  bucketName = "logistic", 
  folder = "uploads",
  maxImages = 5,
  className = ""
}: ImageUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const uploadImage = async (file: File) => {
    try {
      setUploading(true);
      
      // Create unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(fileName, file);

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucketName)
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถอัพโหลดรูปภาพได้",
        variant: "destructive"
      });
      throw error;
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    if (images.length + files.length > maxImages) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: `สามารถอัพโหลดได้สูงสุด ${maxImages} รูป`,
        variant: "destructive"
      });
      return;
    }

    try {
      const uploadPromises = Array.from(files).map(uploadImage);
      const uploadedUrls = await Promise.all(uploadPromises);
      onImagesChange([...images, ...uploadedUrls]);
      
      toast({
        title: "สำเร็จ",
        description: "อัพโหลดรูปภาพเรียบร้อยแล้ว"
      });
    } catch (error) {
      // Error already handled in uploadImage
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileChange}
        className="hidden"
      />
      
      {/* Upload Button */}
      <Button
        type="button"
        variant="outline"
        onClick={openFileDialog}
        disabled={uploading || images.length >= maxImages}
        className="w-full hover-scale"
      >
        {uploading ? (
          <>
            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-b-transparent border-primary" />
            กำลังอัพโหลด...
          </>
        ) : (
          <>
            <Camera className="mr-2 h-4 w-4" />
            {images.length === 0 ? "อัพโหลดรูปภาพ" : "เพิ่มรูปภาพ"}
          </>
        )}
      </Button>
      
      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {images.map((imageUrl, index) => (
            <Card key={index} className="relative group overflow-hidden bg-gradient-card border-0 shadow-card">
              <div className="aspect-square relative">
                <img
                  src={imageUrl}
                  alt={`อัพโหลดรูปที่ ${index + 1}`}
                  className="w-full h-full object-cover rounded-lg"
                  onError={(e) => {
                    e.currentTarget.src = '/placeholder.svg';
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeImage(index)}
                  className="absolute top-2 right-2 h-6 w-6 p-0 bg-destructive text-destructive-foreground hover:bg-destructive/90 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
      
      {/* Images Counter */}
      {images.length > 0 && (
        <div className="text-sm text-muted-foreground text-center">
          {images.length}/{maxImages} รูป
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
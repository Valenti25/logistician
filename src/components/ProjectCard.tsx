import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CalendarDays, MapPin, Users, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ProjectCardProps {
  id: string;
  name: string;
  location: string;
  status: "active" | "pending" | "completed";
  progress: number;
  startDate: string;
  endDate: string;
  teamName: string;
  budget: string;
}

const ProjectCard = ({ 
  id,
  name, 
  location, 
  status, 
  progress, 
  startDate, 
  endDate, 
  teamName, 
  budget 
}: ProjectCardProps) => {
  const navigate = useNavigate();
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-success text-success-foreground";
      case "pending":
        return "bg-warning text-warning-foreground";
      case "completed":
        return "bg-primary text-primary-foreground";
      default:
        return "bg-secondary text-secondary-foreground";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return "กำลังดำเนินการ";
      case "pending":
        return "รอเริ่มงาน";
      case "completed":
        return "เสร็จสิ้น";
      default:
        return "ไม่ทราบสถานะ";
    }
  };

  return (
    <Card className="bg-gradient-card shadow-card border-0 hover:shadow-elevated transition-all duration-300 hover-scale group">
      <CardHeader className="pb-3 md:pb-4">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base md:text-lg font-semibold text-primary line-clamp-2 group-hover:text-accent transition-colors">
            {name}
          </CardTitle>
          <Badge className={`${getStatusColor(status)} text-xs font-medium shrink-0`}>
            {getStatusText(status)}
          </Badge>
        </div>
        <div className="flex items-center text-sm text-muted-foreground">
          <MapPin className="mr-1 h-3 w-3 md:h-4 md:w-4 shrink-0" />
          <span className="line-clamp-1">{location}</span>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3 md:space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">ความคืบหน้า</span>
            <span className="font-medium text-primary">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 text-sm">
          <div className="space-y-1">
            <div className="flex items-center text-muted-foreground">
              <CalendarDays className="mr-1 h-3 w-3" />
              วันที่เริ่ม
            </div>
            <div className="font-medium text-foreground text-xs md:text-sm">{startDate}</div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center text-muted-foreground">
              <CalendarDays className="mr-1 h-3 w-3" />
              วันที่สิ้นสุด
            </div>
            <div className="font-medium text-foreground text-xs md:text-sm">{endDate}</div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2 border-t border-border">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 text-sm">
            <div className="flex items-center text-muted-foreground">
              <Users className="mr-1 h-3 w-3 md:h-4 md:w-4" />
              <span className="text-xs md:text-sm">{teamName || "ไม่ระบุทีม"}</span>
            </div>
            <div className="font-medium text-accent text-sm md:text-base">
              ฿{budget}
            </div>
          </div>
          <Button 
            size="sm" 
            variant="outline" 
            className="h-8 md:h-9 text-xs md:text-sm w-full sm:w-auto hover-scale"
            onClick={() => navigate(`/projects/${id}`)}
          >
            <Eye className="mr-1 h-3 w-3" />
            ดูรายละเอียด
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectCard;
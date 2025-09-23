import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Navigation from "@/components/Navigation";
import MaterialRequestForm from "@/components/MaterialRequestForm";
import { Search, Package, CheckCircle, XCircle, Eye, FileText, Trash2 } from "lucide-react";
import ImageViewer from "@/components/ImageViewer";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMaterialRequests } from "@/hooks/useMaterialRequests";
import { useProjects } from "@/hooks/useProjects";

const MaterialRequest = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const { materialRequests, loading, updateRequestStatus, deleteRequest } = useMaterialRequests();
  const { projects } = useProjects();

  // Get project name by ID
  const getProjectName = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    return project?.name || "ไม่พบโครงการ";
  };

  const filteredRequests = materialRequests.filter(request => {
    const projectName = getProjectName(request.project_id);
    const matchesSearch = projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.requester_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.request_code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || request.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusCount = (status: string) => {
    if (status === "all") return materialRequests.length;
    return materialRequests.filter(r => r.status === status).length;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-warning text-warning-foreground";
      case "approved":
        return "bg-success text-success-foreground";
      case "delivered":
        return "bg-primary text-primary-foreground";
      case "rejected":
        return "bg-destructive text-destructive-foreground";
      default:
        return "bg-secondary text-secondary-foreground";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "รออนุมัติ";
      case "approved":
        return "อนุมัติแล้ว";
      case "delivered":
        return "จัดส่งแล้ว";
      case "rejected":
        return "ไม่อนุมัติ";
      default:
        return "ไม่ทราบสถานะ";
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "high":
        return "bg-destructive text-destructive-foreground";
      case "normal":
        return "bg-accent text-accent-foreground";
      case "low":
        return "bg-muted text-muted-foreground";
      default:
        return "bg-secondary text-secondary-foreground";
    }
  };

  const getUrgencyText = (urgency: string) => {
    switch (urgency) {
      case "high":
        return "เร่งด่วน";
      case "normal":
        return "ปกติ";
      case "low":
        return "ไม่เร่งด่วน";
      default:
        return "ไม่ระบุ";
    }
  };

  const handleDeleteRequest = async (id: string, requestCode: string) => {
    if (confirm(`คุณแน่ใจหรือไม่ที่จะลบคำขอ "${requestCode}"?`)) {
      try {
        await deleteRequest(id);
      } catch (error) {
        // Error handled by hook
      }
    }
  };

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-6 md:py-8">
        {/* Mobile-first layout */}
        <div className="space-y-6 md:space-y-8">
          {/* Mobile Navigation */}
          <div className="lg:hidden">
            <Navigation />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
            {/* Desktop Navigation Sidebar */}
            <div className="hidden lg:block lg:col-span-1">
              <Navigation />
            </div>

            <div className="lg:col-span-3 space-y-6 md:space-y-8">
              <div className="flex flex-col gap-4 animate-fade-in">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-primary">เบิกวัสดุ</h1>
                    <p className="text-muted-foreground mt-1 text-sm md:text-base">จัดการการเบิกวัสดุและอุปกรณ์ในโครงการ</p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    <Button
                      onClick={() => navigate('/material-summary')}
                      className="bg-gradient-primary text-white border-0 hover-scale w-full sm:w-auto"
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      สรุปอุปกรณ์
                    </Button>
                    <MaterialRequestForm />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 animate-fade-in [animation-delay:200ms]">
                <Card className="bg-gradient-card shadow-card border-0 hover-scale">
                  <CardContent className="p-3 md:p-4 text-center">
                    <div className="text-xl md:text-2xl font-bold text-primary">{getStatusCount("all")}</div>
                    <div className="text-xs md:text-sm text-muted-foreground">คำขอทั้งหมด</div>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-card shadow-card border-0 hover-scale">
                  <CardContent className="p-3 md:p-4 text-center">
                    <div className="text-xl md:text-2xl font-bold text-warning">{getStatusCount("pending")}</div>
                    <div className="text-xs md:text-sm text-muted-foreground">รออนุมัติ</div>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-card shadow-card border-0 hover-scale">
                  <CardContent className="p-3 md:p-4 text-center">
                    <div className="text-xl md:text-2xl font-bold text-success">{getStatusCount("approved")}</div>
                    <div className="text-xs md:text-sm text-muted-foreground">อนุมัติแล้ว</div>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-card shadow-card border-0 hover-scale">
                  <CardContent className="p-3 md:p-4 text-center">
                    <div className="text-xl md:text-2xl font-bold text-primary">{getStatusCount("delivered")}</div>
                    <div className="text-xs md:text-sm text-muted-foreground">จัดส่งแล้ว</div>
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-gradient-card shadow-card border-0 animate-fade-in [animation-delay:400ms]">
                <CardHeader className="pb-4">
                  <CardTitle className="text-primary text-lg md:text-xl">รายการเบิกวัสดุ</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-4 mb-6">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input 
                        placeholder="ค้นหาคำขอ, โครงการ หรือผู้เบิก..."
                        className="pl-10 h-12 md:h-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-full h-12 md:h-10">
                        <SelectValue placeholder="กรองตามสถานะ" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">ทั้งหมด</SelectItem>
                        <SelectItem value="pending">รออนุมัติ</SelectItem>
                        <SelectItem value="approved">อนุมัติแล้ว</SelectItem>
                        <SelectItem value="delivered">จัดส่งแล้ว</SelectItem>
                        <SelectItem value="rejected">ไม่อนุมัติ</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {loading ? (
                    <div className="text-center py-12">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      <div className="text-muted-foreground mt-4">กำลังโหลดข้อมุล...</div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredRequests.map((request, index) => (
                        <Card key={request.id} className="bg-gradient-card shadow-card border-0 hover:shadow-elevated transition-all duration-300 hover-scale animate-fade-in" style={{ animationDelay: `${600 + index * 100}ms` }}>
                          <CardContent className="p-4 md:p-6">
                            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-primary text-base md:text-lg">{request.request_code}</h3>
                                <p className="text-muted-foreground text-sm md:text-base line-clamp-1">{getProjectName(request.project_id)}</p>
                                <p className="text-sm text-muted-foreground">ผู้เบิก: {request.requester_name}</p>
                              </div>
                              <div className="flex flex-col sm:flex-row gap-2 shrink-0">
                                <Badge className={getUrgencyColor(request.urgency)}>
                                  {getUrgencyText(request.urgency)}
                                </Badge>
                                <Badge className={getStatusColor(request.status)}>
                                  {getStatusText(request.status)}
                                </Badge>
                              </div>
                            </div>

                            {request.material_items && (
                              <div className="mb-4">
                                <h4 className="font-medium text-primary mb-2 text-sm md:text-base">รายการวัสดุ:</h4>
                                <div className="space-y-1 text-sm max-h-32 overflow-y-auto">
                                  {request.material_items.map((item, index) => (
                                    <div key={index} className="flex justify-between py-1">
                                      <span className="line-clamp-1">{item.item_name}</span>
                                      <span className="text-muted-foreground shrink-0 ml-2">{item.quantity} {item.unit}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Images */}
                            {request.images_url && request.images_url.length > 0 && (
                              <div className="mb-4">
                                <ImageViewer images={request.images_url} />
                              </div>
                            )}

                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-4 border-t border-border">
                              <div className="text-sm text-muted-foreground">
                                วันที่เบิก: {new Date(request.request_date).toLocaleDateString('th-TH')}
                              </div>
                              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => navigate('/material-tracking')}
                                  className="w-full sm:w-auto hover-scale"
                                >
                                  <Eye className="mr-1 h-3 w-3" />
                                  ดูรายละเอียด
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="text-destructive hover:text-destructive w-full sm:w-auto hover-scale"
                                  onClick={() => handleDeleteRequest(request.id, request.request_code)}
                                >
                                  <Trash2 className="mr-1 h-3 w-3" />
                                  ลบ
                                </Button>
                                {request.status === "pending" && (
                                  <div className="flex gap-2">
                                    <Button 
                                      size="sm" 
                                      variant="outline" 
                                      className="text-success border-success hover:bg-success/10 flex-1 sm:flex-none hover-scale"
                                      onClick={() => updateRequestStatus(request.id, "approved")}
                                    >
                                      <CheckCircle className="mr-1 h-3 w-3" />
                                      อนุมัติ
                                    </Button>
                                    <Button 
                                      size="sm" 
                                      variant="outline" 
                                      className="text-destructive border-destructive hover:bg-destructive/10 flex-1 sm:flex-none hover-scale"
                                      onClick={() => updateRequestStatus(request.id, "rejected")}
                                    >
                                      <XCircle className="mr-1 h-3 w-3" />
                                      ปฏิเสธ
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}

                      {filteredRequests.length === 0 && (
                        <div className="text-center py-12">
                          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                          <div className="text-muted-foreground">ไม่พบรายการเบิกวัสดุที่ตรงกับการค้นหา</div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaterialRequest;
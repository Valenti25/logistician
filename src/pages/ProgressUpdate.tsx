import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Navigation from "@/components/Navigation";
import AddProgressUpdateDialog from "@/components/AddProgressUpdateDialog";
import EditProgressUpdateDialog from "@/components/EditProgressUpdateDialog";
import { useProgressUpdates } from "@/hooks/useProgressUpdates";
import { useProjects } from "@/hooks/useProjects";
import { Search, Plus, TrendingUp, Calendar, User, Edit, Trash2 } from "lucide-react";
import ImageViewer from "@/components/ImageViewer";
import { useState } from "react";

const ProgressUpdate = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [projectFilter, setProjectFilter] = useState("all");
  const { progressUpdates, loading, deleteProgressUpdate } = useProgressUpdates();
  const { projects } = useProjects();

  const filteredUpdates = progressUpdates.filter(update => {
    const projectName = projects.find(p => p.id === update.project_id)?.name || "";
    const matchesSearch = projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         update.updated_by.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         update.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesProject = projectFilter === "all" || update.project_id === projectFilter;
    
    return matchesSearch && matchesProject;
  });

  const projectsWithUpdates = [...new Set(progressUpdates.map(update => update.project_id))];

  const getTodayUpdates = () => {
    const today = new Date().toISOString().split('T')[0];
    return progressUpdates.filter(update => update.update_date === today).length;
  };

  const getAvgProgress = () => {
    if (progressUpdates.length === 0) return 0;
    const totalProgress = progressUpdates.reduce((sum, update) => sum + update.progress_percentage, 0);
    return Math.round(totalProgress / progressUpdates.length);
  };

  const handleDeleteUpdate = async (id: string, projectName: string) => {
    if (confirm(`คุณแน่ใจหรือไม่ที่จะลบการอัพเดทของโครงการ "${projectName}"?`)) {
      try {
        await deleteProgressUpdate(id);
      } catch (error) {
        // Error handled by hook
      }
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Navigation Sidebar */}
          <div className="lg:col-span-1">
            <Navigation />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold text-primary">อัพเดทความคืบหน้า</h1>
                <p className="text-muted-foreground mt-1">บันทึกและติดตามความคืบหน้าในแต่ละโครงการ</p>
              </div>
              <AddProgressUpdateDialog />
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="bg-gradient-card shadow-card-custom border-0">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-primary">{progressUpdates.length}</div>
                  <div className="text-sm text-muted-foreground">อัพเดททั้งหมด</div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-card shadow-card-custom border-0">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-success">{getTodayUpdates()}</div>
                  <div className="text-sm text-muted-foreground">อัพเดทวันนี้</div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-card shadow-card-custom border-0">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-accent">{getAvgProgress()}%</div>
                  <div className="text-sm text-muted-foreground">ความคืบหน้าเฉลี่ย</div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-card shadow-card-custom border-0">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-primary">{projectsWithUpdates.length}</div>
                  <div className="text-sm text-muted-foreground">โครงการที่มีอัพเดท</div>
                </CardContent>
              </Card>
            </div>

            {/* Search and Filter */}
            <Card className="bg-gradient-card shadow-card-custom border-0">
              <CardHeader>
                <CardTitle className="text-primary">รายการอัพเดท</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input 
                      placeholder="ค้นหาโครงการ, ผู้อัพเดท หรือประเภทงาน..."
                      className="pl-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Select value={projectFilter} onValueChange={setProjectFilter}>
                    <SelectTrigger className="w-full sm:w-[250px]">
                      <SelectValue placeholder="กรองตามโครงการ" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">ทุกโครงการ</SelectItem>
                      {projects.map(project => (
                        <SelectItem key={project.id} value={project.id}>{project.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Progress Updates List */}
                {loading ? (
                  <div className="text-center py-12">
                    <div className="text-muted-foreground">กำลังโหลดข้อมูล...</div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredUpdates.map((update) => {
                      const project = projects.find(p => p.id === update.project_id);
                      return (
                        <Card key={update.id} className="bg-gradient-card shadow-card-custom border-0 hover:shadow-elevated transition-all duration-300">
                          <CardContent className="p-6">
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <h3 className="font-semibold text-primary text-lg">{project?.name || "ไม่พบโครงการ"}</h3>
                                <div className="flex items-center gap-2 mt-1">
                                  <User className="h-4 w-4 text-muted-foreground" />
                                  <span className="text-sm text-muted-foreground">{update.updated_by}</span>
                                  <Calendar className="h-4 w-4 text-muted-foreground ml-2" />
                                  <span className="text-sm text-muted-foreground">{new Date(update.update_date).toLocaleDateString('th-TH')}</span>
                                </div>
                              </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6 mb-4">
                              <div>
                                <h4 className="font-medium text-primary mb-2">ความคืบหน้า:</h4>
                                <div className="space-y-2">
                                  <div className="flex justify-between text-sm">
                                    <span className="font-medium text-success">ปัจจุบัน: {update.progress_percentage}%</span>
                                  </div>
                                  <Progress value={update.progress_percentage} className="h-3" />
                                </div>
                              </div>
                              <div>
                                <h4 className="font-medium text-primary mb-2">รายละเอียด:</h4>
                                <p className="text-sm text-muted-foreground mb-2">{update.description}</p>
                              </div>
                            </div>

                            {/* Images */}
                            {update.photos_url && update.photos_url.length > 0 && (
                              <div className="mb-4">
                                <ImageViewer images={update.photos_url} />
                              </div>
                            )}

                            <div className="flex justify-between items-center pt-4 border-t border-border">
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span>รูปภาพ: {update.photos_url?.length || 0} รูป</span>
                                <span>รหัส: {update.id}</span>
                              </div>
                              <div className="flex gap-2">
                                <EditProgressUpdateDialog update={update} />
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="text-destructive hover:text-destructive"
                                  onClick={() => handleDeleteUpdate(update.id, project?.name || "ไม่พบโครงการ")}
                                >
                                  <Trash2 className="mr-1 h-3 w-3" />
                                  ลบ
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}

                {filteredUpdates.length === 0 && !loading && (
                  <div className="text-center py-12">
                    <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <div className="text-muted-foreground">ไม่พบรายการอัพเดทที่ตรงกับการค้นหา</div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressUpdate;
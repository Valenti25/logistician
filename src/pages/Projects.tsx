import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Navigation from "@/components/Navigation";
import ProjectCard from "@/components/ProjectCard";
import AddProjectDialog from "@/components/AddProjectDialog";
import { Search, Plus, Filter, MapPin, Calendar } from "lucide-react";
import { useState } from "react";
import { useProjects } from "@/hooks/useProjects";

const Projects = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const { projects, loading } = useProjects();

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || project.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusCount = (status: string) => {
    if (status === "all") return projects.length;
    return projects.filter(p => p.status === status).length;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('th-TH');
  };

  const formatBudget = (budget: number) => {
    return new Intl.NumberFormat('th-TH').format(budget);
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

            {/* Main Content */}
            <div className="lg:col-span-3 space-y-6 md:space-y-8">
              {/* Page Header */}
              <div className="flex flex-col gap-4 animate-fade-in">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-primary">จัดการโครงการ</h1>
                    <p className="text-muted-foreground mt-1 text-sm md:text-base">ดูและจัดการโครงการก่อสร้างทั้งหมด</p>
                  </div>
                  <AddProjectDialog />
                </div>
              </div>

              {/* Stats Overview */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 animate-fade-in [animation-delay:200ms]">
                <Card className="bg-gradient-card shadow-card border-0 hover-scale">
                  <CardContent className="p-3 md:p-4 text-center">
                    <div className="text-xl md:text-2xl font-bold text-primary">{getStatusCount("all")}</div>
                    <div className="text-xs md:text-sm text-muted-foreground">โครงการทั้งหมด</div>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-card shadow-card border-0 hover-scale">
                  <CardContent className="p-3 md:p-4 text-center">
                    <div className="text-xl md:text-2xl font-bold text-success">{getStatusCount("active")}</div>
                    <div className="text-xs md:text-sm text-muted-foreground">กำลังดำเนินการ</div>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-card shadow-card border-0 hover-scale">
                  <CardContent className="p-3 md:p-4 text-center">
                    <div className="text-xl md:text-2xl font-bold text-warning">{getStatusCount("pending")}</div>
                    <div className="text-xs md:text-sm text-muted-foreground">รอเริ่มงาน</div>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-card shadow-card border-0 hover-scale">
                  <CardContent className="p-3 md:p-4 text-center">
                    <div className="text-xl md:text-2xl font-bold text-primary">{getStatusCount("completed")}</div>
                    <div className="text-xs md:text-sm text-muted-foreground">เสร็จสิ้น</div>
                  </CardContent>
                </Card>
              </div>

              {/* Search and Filter */}
              <Card className="bg-gradient-card shadow-card border-0 animate-fade-in [animation-delay:400ms]">
                <CardHeader className="pb-4">
                  <CardTitle className="text-primary text-lg md:text-xl">รายการโครงการ</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-4 mb-6">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input 
                        placeholder="ค้นหาโครงการหรือสถานที่..."
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
                        <SelectItem value="active">กำลังดำเนินการ</SelectItem>
                        <SelectItem value="pending">รอเริ่มงาน</SelectItem>
                        <SelectItem value="completed">เสร็จสิ้น</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Projects Grid */}
                  {loading ? (
                    <div className="text-center py-12">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      <div className="text-muted-foreground mt-4">กำลังโหลดข้อมูล...</div>
                    </div>
                  ) : (
                    <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2">
                      {filteredProjects.map((project, index) => (
                        <div key={project.id} className="animate-fade-in" style={{ animationDelay: `${600 + index * 200}ms` }}>
                          <ProjectCard 
                            id={project.id}
                            name={project.name}
                            location={project.location}
                            status={project.status as any}
                            progress={project.progress}
                            startDate={formatDate(project.start_date)}
                            endDate={formatDate(project.end_date)}
                            teamName={project.team_name}
                            budget={formatBudget(project.budget)}
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  {filteredProjects.length === 0 && !loading && (
                    <div className="text-center py-12">
                      <div className="text-muted-foreground">ไม่พบโครงการที่ตรงกับการค้นหา</div>
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

export default Projects;
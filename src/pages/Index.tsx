import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import StatsCards from "@/components/StatsCards";
import ProjectCard from "@/components/ProjectCard";
import Navigation from "@/components/Navigation";
import AddProjectDialog from "@/components/AddProjectDialog";
import SearchAndFilter from "@/components/SearchAndFilter";
import heroImage from "@/assets/construction-hero.jpg";
import { Plus } from "lucide-react";
import { useProjects } from "@/hooks/useProjects";
import { useState } from "react";

const Index = () => {
  const { projects } = useProjects();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('th-TH');
  };

  const formatBudget = (budget: number) => {
    return new Intl.NumberFormat('th-TH').format(budget);
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.team_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || project.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const displayProjects = filteredProjects.slice(0, 8);

  const filterOptions = [
    { value: "all", label: "ทั้งหมด" },
    { value: "planning", label: "กำลังวางแผน" },
    { value: "in-progress", label: "กำลังดำเนินการ" },
    { value: "on-hold", label: "รอเริ่มงาน" },
    { value: "completed", label: "เสร็จสิ้น" },
    { value: "cancelled", label: "ยกเลิก" }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative bg-gradient-hero overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="relative container mx-auto px-4 py-12 md:py-16">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold text-primary-foreground mb-4 md:mb-6 animate-fade-in">
              ระบบบริหารโครงการก่อสร้าง
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/90 mb-6 md:mb-8 max-w-2xl mx-auto animate-fade-in [animation-delay:200ms]">
              บริหารจัดการโครงการก่อสร้างอย่างครบวงจร ตั้งแต่การวางแผน การติดตามความคืบหน้า การเบิกจ่ายวัสดุ และการจัดการทีมงาน
            </p>
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center animate-fade-in [animation-delay:400ms]">
              <AddProjectDialog>
                <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground shadow-elevated hover-scale">
                  <Plus className="mr-2 h-5 w-5" />
                  เพิ่มโครงการใหม่
                </Button>
              </AddProjectDialog>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 md:py-8">
        {/* Mobile-first layout */}
        <div className="space-y-6 md:space-y-8">
          {/* Navigation - Mobile Bottom Bar, Desktop Sidebar */}
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
              {/* Stats Cards */}
              <div className="animate-fade-in [animation-delay:600ms]">
                <StatsCards />
              </div>

              {/* Projects Section */}
              <Card className="bg-gradient-card shadow-card border-0 animate-fade-in [animation-delay:800ms]">
                <CardHeader className="pb-4">
                  <CardTitle className="text-primary text-lg md:text-xl">โครงการทั้งหมด ({filteredProjects.length} โครงการ)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-6">
                    <SearchAndFilter 
                      searchTerm={searchTerm}
                      onSearchChange={setSearchTerm}
                      filterValue={statusFilter}
                      onFilterChange={setStatusFilter}
                      searchPlaceholder="ค้นหาโครงการ สถานที่ หรือทีมงาน..."
                      filterPlaceholder="กรองตามสถานะ"
                      filterOptions={filterOptions}
                    />
                  </div>

                  {/* Projects Grid - Mobile-optimized */}
                  <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2">
                    {displayProjects.length > 0 ? (
                      displayProjects.map((project, index) => (
                        <div key={project.id} className="animate-fade-in" style={{ animationDelay: `${1000 + index * 200}ms` }}>
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
                      ))
                    ) : (
                      <div className="col-span-2 text-center py-12">
                        <div className="text-muted-foreground">
                          {searchTerm || statusFilter !== "all" 
                            ? "ไม่พบโครงการที่ตรงกับเงื่อนไขที่ค้นหา" 
                            : "ยังไม่มีโครงการ เริ่มต้นด้วยการเพิ่มโครงการใหม่"}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
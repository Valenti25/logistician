import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navigation from "@/components/Navigation";
import { ArrowLeft, MapPin, Calendar, Users, DollarSign, Package, ClipboardList, TrendingUp, User } from "lucide-react";
import { useProjects } from "@/hooks/useProjects";
import { useProgressUpdates } from "@/hooks/useProgressUpdates";
import { useMaterialRequests } from "@/hooks/useMaterialRequests";
import { useMaterialTracking } from "@/hooks/useMaterialTracking";
import { useTeamMembers } from "@/hooks/useTeamMembers";

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { projects, loading: projectLoading } = useProjects();
  const { progressUpdates, loading: progressLoading } = useProgressUpdates();
  const { materialRequests, loading: requestsLoading } = useMaterialRequests();
  const { materialTracking, loading: trackingLoading } = useMaterialTracking();
  const { teamMembers, loading: teamLoading } = useTeamMembers();

  const project = projects.find(p => p.id === id);

  const projectProgressUpdates = progressUpdates.filter(update => update.project_id === id);
  const projectMaterialRequests = materialRequests.filter(request => request.project_id === id);
  const projectMaterialTracking = materialTracking.filter(tracking => tracking.project_id === id);
  const assignedTeamMembers = teamMembers.filter(member => 
    project?.assigned_members?.includes(member.id)
  );

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

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('th-TH');
  };

  const formatBudget = (budget: number) => {
    return new Intl.NumberFormat('th-TH').format(budget);
  };

  if (projectLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <div className="text-muted-foreground mt-4">กำลังโหลดข้อมูล...</div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-primary mb-4">ไม่พบโครงการ</h1>
          <Button onClick={() => navigate("/projects")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            กลับไปหน้าโครงการ
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-6 md:py-8">
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
              {/* Header */}
              <div className="flex flex-col gap-4 animate-fade-in">
                <Button 
                  variant="outline" 
                  onClick={() => navigate("/projects")}
                  className="self-start"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  กลับไปหน้าโครงการ
                </Button>
                
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-primary">{project.name}</h1>
                    <p className="text-muted-foreground mt-1 text-sm md:text-base">รายละเอียดโครงการและข้อมูลที่เกี่ยวข้อง</p>
                  </div>
                  <Badge className={`${getStatusColor(project.status)} text-sm font-medium`}>
                    {getStatusText(project.status)}
                  </Badge>
                </div>
              </div>

              {/* Project Overview */}
              <Card className="bg-gradient-card shadow-card border-0 animate-fade-in [animation-delay:200ms]">
                <CardHeader>
                  <CardTitle className="text-primary">ข้อมูลโครงการ</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <MapPin className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">สถานที่</div>
                        <div className="font-medium">{project.location}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Calendar className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">วันที่เริ่ม</div>
                        <div className="font-medium">{formatDate(project.start_date)}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Calendar className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">วันที่สิ้นสุด</div>
                        <div className="font-medium">{formatDate(project.end_date)}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <DollarSign className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">งบประมาณ</div>
                        <div className="font-medium">฿{formatBudget(project.budget)}</div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">ความคืบหน้าโครงการ</span>
                      <span className="font-medium text-primary">{project.progress}%</span>
                    </div>
                    <Progress value={project.progress} className="h-3" />
                  </div>

                  {project.description && (
                    <div>
                      <div className="text-sm text-muted-foreground mb-2">รายละเอียด</div>
                      <div className="text-foreground">{project.description}</div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Detailed Information Tabs */}
              <Card className="bg-gradient-card shadow-card border-0 animate-fade-in [animation-delay:400ms]">
                <Tabs defaultValue="progress" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="progress" className="text-xs md:text-sm">
                      <TrendingUp className="h-4 w-4 mr-1" />
                      ความคืบหน้า
                    </TabsTrigger>
                    <TabsTrigger value="materials" className="text-xs md:text-sm">
                      <Package className="h-4 w-4 mr-1" />
                      วัสดุ
                    </TabsTrigger>
                    <TabsTrigger value="requests" className="text-xs md:text-sm">
                      <ClipboardList className="h-4 w-4 mr-1" />
                      คำขอ
                    </TabsTrigger>
                    <TabsTrigger value="team" className="text-xs md:text-sm">
                      <Users className="h-4 w-4 mr-1" />
                      ทีม
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="progress" className="mt-6">
                    <CardHeader className="px-0">
                      <CardTitle className="text-lg">รายงานความคืบหน้า</CardTitle>
                    </CardHeader>
                    <div className="space-y-4">
                      {progressLoading ? (
                        <div className="text-center py-8">
                          <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                        </div>
                      ) : projectProgressUpdates.length > 0 ? (
                        projectProgressUpdates.map((update) => (
                          <Card key={update.id} className="bg-background/50">
                            <CardContent className="p-4">
                              <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline">{update.progress_percentage}%</Badge>
                                  <span className="text-sm text-muted-foreground">
                                    {formatDate(update.update_date)}
                                  </span>
                                </div>
                                <span className="text-sm text-muted-foreground">{update.updated_by}</span>
                              </div>
                              <p className="text-foreground">{update.description}</p>
                            </CardContent>
                          </Card>
                        ))
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          ยังไม่มีรายงานความคืบหน้า
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="materials" className="mt-6">
                    <CardHeader className="px-0">
                      <CardTitle className="text-lg">การติดตามวัสดุ</CardTitle>
                    </CardHeader>
                    <div className="space-y-4">
                      {trackingLoading ? (
                        <div className="text-center py-8">
                          <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                        </div>
                      ) : projectMaterialTracking.length > 0 ? (
                        projectMaterialTracking.map((tracking) => (
                          <Card key={tracking.id} className="bg-background/50">
                            <CardContent className="p-4">
                              <div className="flex justify-between items-start mb-2">
                                <div className="font-medium">{tracking.description}</div>
                                <Badge variant="outline">{tracking.category}</Badge>
                              </div>
                              <div className="grid grid-cols-3 gap-4 text-sm">
                                <div>
                                  <span className="text-muted-foreground">จำนวนทั้งหมด:</span>
                                  <div className="font-medium">{tracking.total_quantity}</div>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">ใช้ไปแล้ว:</span>
                                  <div className="font-medium">{tracking.used_quantity}</div>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">คงเหลือ:</span>
                                  <div className="font-medium">{tracking.remaining_quantity}</div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          ยังไม่มีการติดตามวัสดุ
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="requests" className="mt-6">
                    <CardHeader className="px-0">
                      <CardTitle className="text-lg">คำขอวัสดุ</CardTitle>
                    </CardHeader>
                    <div className="space-y-4">
                      {requestsLoading ? (
                        <div className="text-center py-8">
                          <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                        </div>
                      ) : projectMaterialRequests.length > 0 ? (
                        projectMaterialRequests.map((request) => (
                          <Card key={request.id} className="bg-background/50">
                            <CardContent className="p-4">
                              <div className="flex justify-between items-start mb-2">
                                <div className="font-medium">{request.request_code}</div>
                                <Badge variant={request.status === 'approved' ? 'default' : 'secondary'}>
                                  {request.status === 'pending' ? 'รออนุมัติ' : 
                                   request.status === 'approved' ? 'อนุมัติแล้ว' : 'ปฏิเสธ'}
                                </Badge>
                              </div>
                              <div className="text-sm text-muted-foreground mb-2">
                                ผู้ขอ: {request.requester_name} | วันที่: {formatDate(request.request_date)}
                              </div>
                              <div className="text-sm text-muted-foreground mb-2">
                                ความเร่งด่วน: {request.urgency === 'high' ? 'สูง' : 
                                             request.urgency === 'medium' ? 'ปานกลาง' : 'ปกติ'}
                              </div>
                              {request.notes && (
                                <p className="text-sm text-foreground">{request.notes}</p>
                              )}
                            </CardContent>
                          </Card>
                        ))
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          ยังไม่มีคำขอวัสดุ
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="team" className="mt-6">
                    <CardHeader className="px-0">
                      <CardTitle className="text-lg">ทีมงานที่ได้รับมอบหมาย</CardTitle>
                    </CardHeader>
                    <div className="space-y-4">
                      {teamLoading ? (
                        <div className="text-center py-8">
                          <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                        </div>
                      ) : assignedTeamMembers.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {assignedTeamMembers.map((member) => (
                            <Card key={member.id} className="bg-background/50">
                              <CardContent className="p-4">
                                <div className="flex items-start gap-3">
                                  <div className="p-2 bg-primary/10 rounded-lg">
                                    <User className="h-4 w-4 text-primary" />
                                  </div>
                                  <div className="flex-1">
                                    <div className="font-medium">{member.name}</div>
                                    <div className="text-sm text-muted-foreground">{member.role}</div>
                                    {member.email && (
                                      <div className="text-sm text-muted-foreground">{member.email}</div>
                                    )}
                                    {member.experience && (
                                      <div className="text-sm text-muted-foreground">
                                        ประสบการณ์: {member.experience}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          ยังไม่มีทีมงานที่ได้รับมอบหมาย
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetails;
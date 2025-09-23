import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Navigation from "@/components/Navigation";
import AddTeamMemberDialog from "@/components/AddTeamMemberDialog";
import EditTeamMemberDialog from "@/components/EditTeamMemberDialog";
import { useTeamMembers } from "@/hooks/useTeamMembers";
import { Search, Users, Phone, Mail, Calendar, Edit, Trash2, UserCheck } from "lucide-react";
import { useState } from "react";

const TeamManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const { teamMembers, loading, deleteTeamMember } = useTeamMembers();

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "active":
        return "bg-success text-success-foreground";
      case "on-leave":
        return "bg-warning text-warning-foreground";
      case "inactive":
        return "bg-destructive text-destructive-foreground";
      default:
        return "bg-secondary text-secondary-foreground";
    }
  };

  const getStatusText = (status?: string) => {
    switch (status) {
      case "active":
        return "ปฏิบัติงาน";
      case "on-leave":
        return "ลาพัก";
      case "inactive":
        return "ไม่ปฏิบัติงาน";
      default:
        return "ไม่ทราบสถานะ";
    }
  };

  const filteredMembers = teamMembers.filter(member => {
    const matchesSearch = member.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.specialty?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "all" || member.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  const roles = [...new Set(teamMembers.map(member => member.role).filter(Boolean))];

  const getStatusCount = (status: string) => {
    return teamMembers.filter(member => member.status === status).length;
  };

  const getInitials = (name?: string) => {
    if (!name) return "N/A";
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const handleDeleteMember = async (id: string) => {
    if (confirm("คุณแน่ใจหรือไม่ที่จะลบสมาชิกคนนี้?")) {
      try {
        await deleteTeamMember(id);
      } catch (error) {
        // Error handled by hook
      }
    }
  };

  const parseProjects = (projects?: string) => {
    if (!projects) return [];
    try {
      return Array.isArray(projects) ? projects : projects.split(',').map(p => p.trim());
    } catch {
      return [projects];
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <Navigation />
          </div>

          <div className="lg:col-span-3 space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold text-primary">จัดการทีมงาน</h1>
                <p className="text-muted-foreground mt-1">จัดการข้อมูลช่างและทีมงานในระบบ</p>
              </div>
              <AddTeamMemberDialog />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="bg-gradient-card shadow-card-custom border-0">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-primary">{teamMembers.length}</div>
                  <div className="text-sm text-muted-foreground">สมาชิกทั้งหมด</div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-card shadow-card-custom border-0">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-success">{getStatusCount("active")}</div>
                  <div className="text-sm text-muted-foreground">ปฏิบัติงาน</div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-card shadow-card-custom border-0">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-warning">{getStatusCount("on-leave")}</div>
                  <div className="text-sm text-muted-foreground">ลาพัก</div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-card shadow-card-custom border-0">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-destructive">{getStatusCount("inactive")}</div>
                  <div className="text-sm text-muted-foreground">ไม่ปฏิบัติงาน</div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-gradient-card shadow-card-custom border-0">
              <CardHeader>
                <CardTitle className="text-primary">รายชื่อทีมงาน</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input 
                      placeholder="ค้นหาชื่อ, ตำแหน่ง หรือความเชี่ยวชาญ..."
                      className="pl-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger className="w-full sm:w-[200px]">
                      <SelectValue placeholder="กรองตามตำแหน่ง" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">ทุกตำแหน่ง</SelectItem>
                      {roles.map(role => (
                        <SelectItem key={role} value={role || ""}>{role}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {loading ? (
                  <div className="text-center py-12">
                    <div className="text-muted-foreground">กำลังโหลดข้อมูล...</div>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2">
                    {filteredMembers.map((member) => (
                      <Card key={member.id} className="bg-gradient-card shadow-card-custom border-0 hover:shadow-elevated transition-all duration-300">
                        <CardContent className="p-6">
                           <div className="flex items-start gap-4">
                             <Avatar className="h-12 w-12">
                               <AvatarImage 
                                 src={member.avatar_url || undefined} 
                                 alt={member.name}
                                 className="object-cover"
                               />
                               <AvatarFallback className="bg-gradient-primary text-primary-foreground">
                                 {getInitials(member.name)}
                               </AvatarFallback>
                             </Avatar>
                             
                             <div className="flex-1 min-w-0">
                               <div className="flex justify-between items-start mb-2">
                                 <div>
                                   <h3 className="font-semibold text-primary">{member.name}</h3>
                                   <p className="text-sm text-muted-foreground">{member.role}</p>
                                 </div>
                                 <Badge className={getStatusColor(member.status)}>
                                   {getStatusText(member.status)}
                                 </Badge>
                               </div>

                               <div className="space-y-2 text-sm">
                                 <div className="flex items-center gap-2">
                                   <UserCheck className="h-4 w-4 text-muted-foreground" />
                                   <span>{member.specialty || "ไม่ระบุ"}</span>
                                   <span className="text-muted-foreground">• {member.experience || "ไม่ระบุ"}</span>
                                 </div>
                                 
                                 <div className="flex items-center gap-2">
                                   <Phone className="h-4 w-4 text-muted-foreground" />
                                   <span>{member.phone || "ไม่ระบุ"}</span>
                                 </div>
                                 
                                 <div className="flex items-center gap-2">
                                   <Mail className="h-4 w-4 text-muted-foreground" />
                                   <span className="truncate">{member.email || "ไม่ระบุ"}</span>
                                 </div>

                                 <div className="flex items-center gap-2">
                                   <Calendar className="h-4 w-4 text-muted-foreground" />
                                   <span>เริ่มงาน: {member.join_date ? new Date(member.join_date).toLocaleDateString('th-TH') : "ไม่ระบุ"}</span>
                                 </div>
                               </div>

                               <div className="mt-3">
                                 <h4 className="text-sm font-medium text-primary mb-1">โครงการที่รับผิดชอบ:</h4>
                                 <div className="flex flex-wrap gap-1">
                                   {parseProjects(member.projects).map((project, index) => (
                                     <Badge key={index} variant="outline" className="text-xs">
                                       {project}
                                     </Badge>
                                   ))}
                                   {parseProjects(member.projects).length === 0 && (
                                     <span className="text-xs text-muted-foreground">ไม่มีโครงการ</span>
                                   )}
                                 </div>
                               </div>

                               <div className="flex justify-between items-center mt-4 pt-3 border-t border-border">
                                 <div className="flex gap-2">
                                   <EditTeamMemberDialog member={member} />
                                   <Button 
                                     size="sm" 
                                     variant="outline" 
                                     className="text-destructive hover:text-destructive"
                                     onClick={() => handleDeleteMember(member.id)}
                                   >
                                     <Trash2 className="mr-1 h-3 w-3" />
                                     ลบ
                                   </Button>
                                 </div>
                               </div>
                             </div>
                           </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                {filteredMembers.length === 0 && !loading && (
                  <div className="text-center py-12">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <div className="text-muted-foreground">ไม่พบสมาชิกทีมที่ตรงกับการค้นหา</div>
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

export default TeamManagement;
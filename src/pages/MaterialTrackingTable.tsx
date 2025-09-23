import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Navigation from "@/components/Navigation";
import SearchAndFilter from "@/components/SearchAndFilter";
import { ArrowLeft, Save, Plus, Trash2 } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useMaterialTracking, MaterialTracking } from "@/hooks/useMaterialTracking";
import { useProjects } from "@/hooks/useProjects";

const MaterialTrackingTable = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('project');
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  
  const { materialTracking, updateMaterialTracking, createMaterialTracking, deleteMaterialTracking, loading } = useMaterialTracking();
  const { projects } = useProjects();
  
  const [trackingDates] = useState([
    new Date().toLocaleDateString('th-TH', { day: '2-digit', month: '2-digit', year: '2-digit' }),
    new Date(Date.now() + 86400000).toLocaleDateString('th-TH', { day: '2-digit', month: '2-digit', year: '2-digit' }),
    new Date(Date.now() + 172800000).toLocaleDateString('th-TH', { day: '2-digit', month: '2-digit', year: '2-digit' }),
    new Date(Date.now() + 259200000).toLocaleDateString('th-TH', { day: '2-digit', month: '2-digit', year: '2-digit' })
  ]);

  const currentProject = projects.find(p => p.id === projectId);
  const projectTitle = currentProject ? `สรุปอุปกรณ์ ${currentProject.name}` : "สรุปอุปกรณ์";
  
  const filteredMaterials = materialTracking.filter(item => {
    const matchesProject = !projectId || item.project_id === projectId;
    const matchesSearch = item.description?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         item.category?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || item.category === statusFilter;
    
    return matchesProject && matchesSearch && matchesStatus;
  });

  const filterOptions = [
    { value: "all", label: "ทั้งหมด" },
    { value: "เบิกอุปกรณ์แล้ว", label: "เบิกอุปกรณ์แล้ว" },
    { value: "เบิกอุปกรณ์ที่แขนง", label: "เบิกอุปกรณ์ที่แขนง" },
    { value: "คำอุปกรณ์แล้ว", label: "คำอุปกรณ์แล้ว" }
  ];

  const addNewItem = async () => {
    if (!projectId) return;
    
    const newItem = {
      project_id: projectId,
      category: "เบิกอุปกรณ์แล้ว",
      description: "",
      total_quantity: 0,
      used_quantity: 0,
      remaining_quantity: 0,
      date_usage: {}
    };
    
    await createMaterialTracking(newItem);
  };

  const updateItem = async (id: string, field: keyof MaterialTracking, value: any) => {
    await updateMaterialTracking(id, { [field]: value });
  };

  const updateDateUsage = async (id: string, date: string, value: number) => {
    const item = materialTracking.find(item => item.id === id);
    if (!item) return;
    
    const newDateUsage = { ...item.date_usage, [date]: value };
    const totalUsed = Object.values(newDateUsage).reduce((sum, val) => sum + (val || 0), 0);
    const remaining = item.total_quantity - totalUsed;
    
    await updateMaterialTracking(id, { 
      date_usage: newDateUsage,
      used_quantity: totalUsed,
      remaining_quantity: remaining
    });
  };

  const removeItem = async (id: string) => {
    await deleteMaterialTracking(id);
  };

  const getRemainingColor = (remaining: number) => {
    if (remaining < 0) return "bg-red-100 text-red-800";
    if (remaining === 0) return "bg-green-100 text-green-800";
    return "";
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

            <div className="lg:col-span-3 space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/material-request')}
                  className="hover-scale"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  กลับ
                </Button>
                <Button className="bg-gradient-primary hover-scale w-full sm:w-auto">
                  <Save className="mr-2 h-4 w-4" />
                  บันทึก
                </Button>
              </div>

              <Card className="bg-gradient-card shadow-card border-0">
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-lg md:text-xl font-bold text-primary bg-accent/20 p-3 rounded-lg">
                    {projectTitle}
                  </CardTitle>
                  <div className="mt-4">
                    <SearchAndFilter 
                      searchTerm={searchTerm}
                      onSearchChange={setSearchTerm}
                      filterValue={statusFilter}
                      onFilterChange={setStatusFilter}
                      searchPlaceholder="ค้นหารายละเอียดวัสดุหรือสถานะ..."
                      filterPlaceholder="กรองตามสถานะ"
                      filterOptions={filterOptions}
                    />
                  </div>
                </CardHeader>
                <CardContent className="p-2 md:p-6">
                  {/* Mobile-optimized table */}
                  <div className="overflow-x-auto -mx-2 md:mx-0">
                    <div className="min-w-[800px] md:min-w-0">
                      <Table className="border-collapse border border-border">
                        <TableHeader>
                          <TableRow className="bg-muted/50">
                            <TableHead className="border border-border text-center font-bold text-xs md:text-sm p-2">สถานะอุปกรณ์</TableHead>
                            <TableHead className="border border-border text-center font-bold text-xs md:text-sm p-2">รายละเอียด</TableHead>
                            <TableHead className="border border-border text-center font-bold text-xs md:text-sm w-16 md:w-24 p-2">จำนวน</TableHead>
                            <TableHead className="border border-border text-center font-bold text-xs md:text-sm w-16 md:w-24 p-2">เบิกใช้จริง</TableHead>
                            <TableHead className="border border-border text-center font-bold text-xs md:text-sm w-16 md:w-24 p-2">คงเหลือ</TableHead>
                            {trackingDates.map(date => (
                              <TableHead key={date} className="border border-border text-center font-bold text-xs w-20 p-1">
                                <div className="space-y-1">
                                  <div>วันที่เบิก</div>
                                  <div className="text-accent font-bold">{date}</div>
                                  <div>ชื่อคนเบิก</div>
                                  <div>แนงค์</div>
                                </div>
                              </TableHead>
                            ))}
                            <TableHead className="border border-border text-center w-12 md:w-16 p-2">ลบ</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredMaterials.map((item, index) => (
                            <TableRow key={item.id} className="hover:bg-muted/30 transition-colors">
                              <TableCell className="border border-border p-1 md:p-2">
                                <Select 
                                  value={item.category} 
                                  onValueChange={(value) => updateItem(item.id, 'category', value)}
                                >
                                  <SelectTrigger className="border-0 h-8 md:h-10 text-xs md:text-sm">
                                    <SelectValue placeholder="เลือกหมวดหมู่" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="เบิกอุปกรณ์แล้ว">เบิกอุปกรณ์แล้ว</SelectItem>
                                    <SelectItem value="เบิกอุปกรณ์ที่แขนง">เบิกอุปกรณ์ที่แขนง</SelectItem>
                                    <SelectItem value="คำอุปกรณ์แล้ว">คำอุปกรณ์แล้ว</SelectItem>
                                  </SelectContent>
                                </Select>
                              </TableCell>
                              <TableCell className="border border-border p-1 md:p-2">
                                <Input
                                  value={item.description}
                                  onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                                  className="border-0 h-8 md:h-10 text-xs md:text-sm"
                                  placeholder="รายละเอียดวัสดุ"
                                />
                              </TableCell>
                              <TableCell className="border border-border p-1 md:p-2 text-center">
                                <Input
                                  type="number"
                                  value={item.total_quantity || ''}
                                  onChange={(e) => updateItem(item.id, 'total_quantity', parseInt(e.target.value) || 0)}
                                  className="border-0 text-center h-8 md:h-10 text-xs md:text-sm w-14 md:w-20"
                                />
                              </TableCell>
                              <TableCell className="border border-border p-1 md:p-2 text-center">
                                <Input
                                  type="number"
                                  value={item.used_quantity || ''}
                                  className="border-0 text-center h-8 md:h-10 text-xs md:text-sm w-14 md:w-20"
                                  readOnly
                                />
                              </TableCell>
                              <TableCell className={`border border-border p-1 md:p-2 text-center text-xs md:text-sm font-medium ${getRemainingColor(item.remaining_quantity || 0)}`}>
                                {item.remaining_quantity || (item.total_quantity - item.used_quantity)}
                              </TableCell>
                              {trackingDates.map(date => (
                                <TableCell key={date} className="border border-border p-1 text-center">
                                  <Input
                                    type="number"
                                    value={item.date_usage[date] || ''}
                                    onChange={(e) => updateDateUsage(item.id, date, parseInt(e.target.value) || 0)}
                                    className="border-0 text-center w-12 md:w-16 h-8 text-xs"
                                    min="0"
                                  />
                                </TableCell>
                              ))}
                              <TableCell className="border border-border p-1 text-center">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => removeItem(item.id)}
                                  className="text-destructive hover:bg-destructive/10 h-8 w-8 p-0"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-center">
                    <Button 
                      onClick={addNewItem} 
                      variant="outline"
                      disabled={!projectId}
                      className="hover-scale w-full sm:w-auto"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      เพิ่มรายการวัสดุ
                    </Button>
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

export default MaterialTrackingTable;
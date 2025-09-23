import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useMaterialTracking } from "@/hooks/useMaterialTracking";
import { useMaterialRequests } from "@/hooks/useMaterialRequests";
import { useProjects } from "@/hooks/useProjects";
import { ArrowLeft, FileText, CalendarIcon } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format, addDays } from "date-fns";
import { th } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import SearchAndFilter from "@/components/SearchAndFilter";
import { useState } from "react";

interface MaterialSummary {
  id: string;
  description: string;
  unit: string;
  total_quantity: number;
  used_quantity: number;
  remaining_quantity: number;
  daily_withdrawals: Record<string, { amount: number; requester: string }[]>;
  status: string;
}

interface MaterialWithdrawal {
  date: string;
  requester_name: string;
  item_name: string;
  quantity: number;
  unit: string;
}

const MaterialSummary = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('projectId');
  
  // Add state for selected date (default to current month)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  
  const { materialTracking, loading: trackingLoading } = useMaterialTracking();
  const { materialRequests, loading: requestsLoading } = useMaterialRequests();
  const { projects } = useProjects();

  const loading = trackingLoading || requestsLoading;
  const project = projects.find(p => p.id === projectId);

  // Get all approved material requests with their withdrawal dates
  const approvedRequests = materialRequests.filter(req => 
    req.status === 'approved' && (!projectId || req.project_id === projectId)
  );

  // Get actual withdrawal dates from approved requests for data lookup
  const actualWithdrawals = new Map<string, any[]>();
  
  approvedRequests.forEach(request => {
    const dateKey = request.request_date;
    if (!actualWithdrawals.has(dateKey)) {
      actualWithdrawals.set(dateKey, []);
    }
    actualWithdrawals.get(dateKey)!.push(request);
  });
  
  // Generate 30 days starting from day 1 of selected month, continuing to next months
  const dateColumns = [];
  const selectedMonth = selectedDate.getMonth();
  const selectedYear = selectedDate.getFullYear();
  
  // Start from day 1 of selected month
  let currentDate = new Date(selectedYear, selectedMonth, 1);
  
  // Generate 30 consecutive days
  for (let i = 0; i < 30; i++) {
    const dateKey = format(currentDate, 'yyyy-MM-dd');
    const buddhistYear = currentDate.getFullYear() + 543;
    
    dateColumns.push({
      date: new Date(currentDate),
      key: dateKey,
      display: `${format(currentDate, 'dd/MM')}/${buddhistYear.toString().slice(-2)}`
    });
    
    // Move to next day
    currentDate = addDays(currentDate, 1);
  }

  function getEquipmentStatus(remaining: number, total: number) {
    if (remaining <= 0) return "หมด";
    if (remaining / total <= 0.1) return "ใกล้หมด";
    if (remaining / total <= 0.3) return "เหลือน้อย";
    return "เพียงพอ";
  }

  // Create materials summary from approved requests and tracking
  const materialSummaries: MaterialSummary[] = [];
  const materialMap = new Map<string, MaterialSummary>();

  // First, add inventory data from material tracking to set total quantities
  materialTracking.forEach(tracking => {
    if (!projectId || tracking.project_id === projectId) {
      const key = `${tracking.description}-ชิ้น`; // Use default unit since tracking doesn't store unit
      
      materialMap.set(key, {
        id: tracking.id,
        description: tracking.description,
        unit: "ชิ้น", // Default unit for tracking data
        total_quantity: Number(tracking.total_quantity || 0),
        used_quantity: 0, // Will be calculated from requests
        remaining_quantity: 0, // Will be calculated
        daily_withdrawals: {},
        status: "เพียงพอ"
      });
    }
  });

  // Process approved material requests to build summary
  approvedRequests.forEach(request => {
    request.material_items.forEach(item => {
      const key = `${item.item_name}`;
      
      if (!materialMap.has(key)) {
        // Initialize new material summary if not from tracking
        materialMap.set(key, {
          id: `material-${key}`,
          description: item.item_name,
          unit: "", // No unit display needed
          total_quantity: Number(item.quantity), // จำนวน from quantity
          used_quantity: Number(item.unit), // เบิกใช้จริง from unit
          remaining_quantity: 0,
          daily_withdrawals: {},
          status: "เพียงพอ"
        });
      } else {
        const material = materialMap.get(key)!;
        material.total_quantity += Number(item.quantity);
        material.used_quantity += Number(item.unit);
      }

      const material = materialMap.get(key)!;
      
      // Record daily withdrawal with requester details
      const requestDate = request.request_date;
      if (!material.daily_withdrawals[requestDate]) {
        material.daily_withdrawals[requestDate] = [];
      }
      
      material.daily_withdrawals[requestDate].push({
        amount: Number(item.unit), // Use unit as withdrawal amount
        requester: request.requester_name
      });
    });
  });

  // Convert map to array and calculate remaining quantities and status
  materialMap.forEach(material => {
    material.remaining_quantity = material.total_quantity - material.used_quantity;
    material.status = getEquipmentStatus(material.remaining_quantity, material.total_quantity);
    materialSummaries.push(material);
  });

  // Filter materials based on search and status
  const filteredMaterials = materialSummaries.filter(material => {
    const matchesSearch = material.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || material.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const filterOptions = [
    { value: "all", label: "ทั้งหมด" },
    { value: "เพียงพอ", label: "เพียงพอ" },
    { value: "เหลือน้อย", label: "เหลือน้อย" },
    { value: "ใกล้หมด", label: "ใกล้หมด" },
    { value: "หมด", label: "หมด" }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "หมด": return "bg-red-500 text-white";
      case "ใกล้หมด": return "bg-red-100 text-red-800";
      case "เหลือน้อย": return "bg-yellow-100 text-yellow-800";
      case "เพียงพอ": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getCellBackgroundColor = (remaining: number) => {
    if (remaining < 0) return "bg-red-500 text-white";
    if (remaining === 0) return "bg-red-100";
    return "";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto py-6 px-4">
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="outline" 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            กลับ
          </Button>
          <div className="ml-auto">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-[200px] justify-start text-left font-normal",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? (
                    format(selectedDate, "MMMM yyyy", { locale: th })
                  ) : (
                    <span>เลือกเดือน</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  className={cn("p-3 pointer-events-auto")}
                  disabled={false}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center text-lg font-bold mb-4">
              {project ? `สรุปอุปกรณ์ ${project.name}` : "สรุปอุปกรณ์ทั้งหมด"}
            </CardTitle>
            <SearchAndFilter 
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              filterValue={statusFilter}
              onFilterChange={setStatusFilter}
              searchPlaceholder="ค้นหารายละเอียดวัสดุ..."
              filterPlaceholder="กรองตามสถานะ"
              filterOptions={filterOptions}
              className=" p-4 rounded-lg"
            />
          </CardHeader>
          
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-20 mx-10 text-center border-r">สถานะอุปกรณ์</TableHead>
                    <TableHead className="min-w- 20 text-center border-r">รายละเอียด</TableHead>
                    <TableHead className="min-w- 20 text-center border-r">จำนวน</TableHead>
                    <TableHead className="min-w- 20 text-center border-r">เบิกใช้จริง</TableHead>
                    <TableHead className="min-w- 20 text-center border-r">คงเหลือ</TableHead>
                    {dateColumns.map((col) => (
                      <TableHead key={col.key} className="w-16 text-center border-r bg-red-100">
                        <div className="text-xs">
                          <div>วันที่เบิก</div>
                          <div>{col.display}</div>
                        </div>
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                
                <TableBody>
                  {filteredMaterials.map((material, index) => {
                    return (
                      <TableRow key={material.id || index} className="hover:bg-muted/50">
                        <TableCell className="text-center border-r p-2">
                          <Badge 
                            variant="secondary"
                            className={getStatusColor(material.status)}
                          >
                            {material.status}
                          </Badge>
                        </TableCell>
                        
                         <TableCell className="border-r p-2">
                           <div className="font-medium text-sm">{material.description}</div>
                         </TableCell>
                        
                        <TableCell className="text-center border-r font-mono text-sm p-2">
                          {material.total_quantity}
                        </TableCell>
                        
                        <TableCell className="text-center border-r font-mono text-sm p-2">
                          {material.used_quantity}
                        </TableCell>
                        
                        <TableCell className={`text-center border-r font-mono text-sm p-2 ${getCellBackgroundColor(material.remaining_quantity)}`}>
                          <span className={material.remaining_quantity <= 0 ? "font-bold" : ""}>
                            {material.remaining_quantity}
                          </span>
                        </TableCell>
                        
                        {dateColumns.map((col) => {
                          // Get withdrawals for this date from actual data
                          const withdrawalRequests = actualWithdrawals.get(col.key) || [];
                          const withdrawals: { amount: number; requester: string }[] = [];
                          
                          // Process all requests for this date
                          withdrawalRequests.forEach(request => {
                            request.material_items.forEach((item: any) => {
                              if (item.item_name === material.description && Number(item.unit) !== 0) {
                                withdrawals.push({
                                  amount: Number(item.unit),
                                  requester: request.requester_name
                                });
                              }
                            });
                          });
                          
                          return (
                            <TableCell key={col.key} className="text-center border-r font-mono text-sm p-2 min-w-16">
                              {withdrawals.length > 0 ? (
                                <div className="flex flex-col items-center gap-1">
                                  {withdrawals.map((withdrawal, idx) => (
                                    <div key={idx} className="flex flex-col items-center">
                                      <div className="font-semibold text-blue-600">{withdrawal.amount}</div>
                                      <div className="text-xs text-muted-foreground">{withdrawal.requester}</div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="text-muted-foreground">-</div>
                              )}
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    );
                  })}
                  
                  {filteredMaterials.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5 + dateColumns.length} className="text-center py-8 text-muted-foreground">
                        ไม่มีข้อมูลการติดตามวัสดุ
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {filteredMaterials.filter(m => m.status === "เพียงพอ").length}
              </div>
              <div className="text-sm text-muted-foreground">รายการเพียงพอ</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {filteredMaterials.filter(m => m.status === "เหลือน้อย").length}
              </div>
              <div className="text-sm text-muted-foreground">รายการเหลือน้อย</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-600">
                {filteredMaterials.filter(m => m.status === "ใกล้หมด").length}
              </div>
              <div className="text-sm text-muted-foreground">รายการใกล้หมด</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-800">
                {filteredMaterials.filter(m => m.status === "หมด").length}
              </div>
              <div className="text-sm text-muted-foreground">รายการหมด</div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default MaterialSummary;
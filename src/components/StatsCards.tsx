import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Clock, Users, Wrench } from "lucide-react";

const StatsCards = () => {
  const stats = [
    {
      title: "โครงการทั้งหมด",
      value: "12",
      icon: BarChart3,
      description: "โครงการกำลังดำเนินการ",
      trend: "+2 โครงการใหม่",
    },
    {
      title: "อัพเดททั้งหมด",
      value: "156",
      icon: Clock,
      description: "ในสัปดาห์นี้",
      trend: "+24 อัพเดท",
    },
    {
      title: "ช่างในระบบ",
      value: "48",
      icon: Users,
      description: "ช่างที่ใช้งานระบบ",
      trend: "+6 คนใหม่",
    },
    {
      title: "การเบิกรายการ",
      value: "89",
      icon: Wrench,
      description: "รายการที่เบิกวันนี้",
      trend: "+12 รายการ",
    },
  ];

  return (
    <div className="grid gap-4 md:gap-6 grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card 
            key={index} 
            className="bg-gradient-card shadow-card border-0 hover:shadow-elevated transition-all duration-300 hover-scale animate-fade-in group"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground group-hover:text-primary transition-colors">
                {stat.title}
              </CardTitle>
              <Icon className="h-4 w-4 md:h-5 md:w-5 text-accent group-hover:text-primary transition-colors" />
            </CardHeader>
            <CardContent className="p-3 md:p-4">
              <div className="text-xl md:text-2xl font-bold text-primary mb-1">{stat.value}</div>
              <p className="text-xs text-muted-foreground mb-1">
                {stat.description}
              </p>
              <p className="text-xs text-success font-medium">
                {stat.trend}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default StatsCards;
import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Stethoscope, UserCog, DollarSign, Activity, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";

export default function Dashboard() {
  const { userRole } = useAuth();
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalDoctors: 0,
    totalStaff: 0,
    totalRevenue: 0,
  });
  const [recentPatients, setRecentPatients] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    // Fetch stats
    const [patientsRes, doctorsRes, staffRes, billsRes] = await Promise.all([
      supabase.from("patients").select("id", { count: "exact" }),
      supabase.from("doctors").select("id", { count: "exact" }),
      supabase.from("staff").select("id", { count: "exact" }),
      supabase.from("bills").select("amount"),
    ]);

    const revenue = billsRes.data?.reduce((sum, bill) => sum + Number(bill.amount), 0) || 0;

    setStats({
      totalPatients: patientsRes.count || 0,
      totalDoctors: doctorsRes.count || 0,
      totalStaff: staffRes.count || 0,
      totalRevenue: revenue,
    });

    // Fetch recent patients
    const { data: patients } = await supabase
      .from("patients")
      .select("*")
      .order("admission_date", { ascending: false })
      .limit(5);

    setRecentPatients(patients || []);

    // Fetch department overview
    const { data: deptData } = await supabase
      .from("patients")
      .select("department");

    const deptCounts = deptData?.reduce((acc: any, patient) => {
      acc[patient.department] = (acc[patient.department] || 0) + 1;
      return acc;
    }, {});

    const deptArray = Object.entries(deptCounts || {}).map(([name, count]) => ({
      name,
      count,
    }));

    setDepartments(deptArray);
  };

  const statCards = [
    {
      title: "Total Patients",
      value: stats.totalPatients,
      description: "Active records",
      icon: Users,
      trend: "+12% from last month",
      color: "text-primary",
    },
    {
      title: "Total Doctors",
      value: stats.totalDoctors,
      description: "Active medical staff",
      icon: Stethoscope,
      trend: "+5% from last month",
      color: "text-blue-600",
    },
    {
      title: "Total Staff",
      value: stats.totalStaff,
      description: "Support personnel",
      icon: UserCog,
      trend: "Stable",
      color: "text-green-600",
    },
    {
      title: "Revenue",
      value: `$${(stats.totalRevenue / 1000).toFixed(1)}k`,
      description: "This month",
      icon: DollarSign,
      trend: "+8% from last month",
      color: "text-yellow-600",
    },
  ];

  const getStatusColor = (status: string): "default" | "destructive" | "outline" | "secondary" => {
    switch (status) {
      case "stable":
        return "default";
      case "critical":
        return "destructive";
      case "recovering":
        return "outline";
      default:
        return "secondary";
    }
  };

  return (
    <Layout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">Hospital overview and statistics</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
                <p className="text-xs text-success flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {stat.trend}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Patients</CardTitle>
              <CardDescription>Latest patient registrations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentPatients.map((patient) => (
                  <div key={patient.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{patient.full_name}</p>
                      <p className="text-sm text-muted-foreground">{patient.department}</p>
                    </div>
                    <Badge variant={getStatusColor(patient.status)}>{patient.status}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Department Overview</CardTitle>
              <CardDescription>Patient distribution by department</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {departments.map((dept: any) => (
                  <div key={dept.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-primary" />
                      <span className="font-medium">{dept.name}</span>
                    </div>
                    <span className="text-muted-foreground">{dept.count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
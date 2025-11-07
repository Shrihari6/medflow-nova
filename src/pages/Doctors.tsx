import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Phone, Mail, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export default function Doctors() {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchDoctors();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = doctors.filter(
        (doctor) =>
          doctor.profiles?.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          doctor.specialization.toLowerCase().includes(searchQuery.toLowerCase()) ||
          doctor.department.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredDoctors(filtered);
    } else {
      setFilteredDoctors(doctors);
    }
  }, [searchQuery, doctors]);

  const fetchDoctors = async () => {
    const { data, error } = await supabase
      .from("doctors")
      .select("*, profiles(full_name)")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setDoctors(data);
      setFilteredDoctors(data);
    }
  };

  return (
    <Layout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Doctors</h1>
            <p className="text-muted-foreground">Medical staff directory and information</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search doctors by name, specialization, or department..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-md"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredDoctors.map((doctor) => (
            <Card key={doctor.id}>
              <CardHeader>
                <div className="space-y-2">
                  <CardTitle className="text-lg">{doctor.profiles?.full_name || "Dr. Name"}</CardTitle>
                  <Badge variant="secondary">{doctor.specialization}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Department</p>
                  <p className="text-sm">{doctor.department}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Qualification</p>
                  <p className="text-sm">{doctor.qualification}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Experience</p>
                  <p className="text-sm">{doctor.experience_years} years</p>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{doctor.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="truncate">{doctor.email}</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{doctor.rating || 0}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{doctor.patient_count} patients</span>
                </div>
                {doctor.availability && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{doctor.availability}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
}
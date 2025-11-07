import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

export default function Patients() {
  const [patients, setPatients] = useState<any[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [rooms, setRooms] = useState<any[]>([]);
  const { userRole } = useAuth();

  const [newPatient, setNewPatient] = useState({
    patient_id: "",
    full_name: "",
    age: "",
    gender: "",
    blood_type: "",
    phone: "",
    email: "",
    address: "",
    emergency_contact: "",
    emergency_phone: "",
    department: "",
    condition: "",
    status: "stable" as "stable" | "critical" | "recovering" | "discharged",
    room_id: "",
    medications: "",
    allergies: "",
  });

  useEffect(() => {
    fetchPatients();
    fetchRooms();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = patients.filter(
        (patient) =>
          patient.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          patient.patient_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          patient.department.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredPatients(filtered);
    } else {
      setFilteredPatients(patients);
    }
  }, [searchQuery, patients]);

  const fetchPatients = async () => {
    const { data, error } = await supabase
      .from("patients")
      .select("*, rooms(room_number)")
      .order("admission_date", { ascending: false });

    if (!error && data) {
      setPatients(data);
      setFilteredPatients(data);
    }
  };

  const fetchRooms = async () => {
    const { data } = await supabase
      .from("rooms")
      .select("*")
      .eq("is_occupied", false);

    if (data) {
      setRooms(data);
    }
  };

  const handleAddPatient = async () => {
    try {
      const { error } = await supabase.from("patients").insert([
        {
          ...newPatient,
          age: parseInt(newPatient.age),
          room_id: newPatient.room_id || null,
          medications: newPatient.medications ? newPatient.medications.split(",").map(m => m.trim()) : [],
          allergies: newPatient.allergies ? newPatient.allergies.split(",").map(a => a.trim()) : [],
        },
      ]);

      if (error) throw error;

      // Update room occupancy
      if (newPatient.room_id) {
        await supabase
          .from("rooms")
          .update({ is_occupied: true })
          .eq("id", newPatient.room_id);
      }

      toast.success("Patient added successfully!");
      setIsAddDialogOpen(false);
      fetchPatients();
      fetchRooms();
      
      // Reset form
      setNewPatient({
        patient_id: "",
        full_name: "",
        age: "",
        gender: "",
        blood_type: "",
        phone: "",
        email: "",
        address: "",
        emergency_contact: "",
        emergency_phone: "",
        department: "",
        condition: "",
        status: "stable",
        room_id: "",
        medications: "",
        allergies: "",
      });
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const canAddPatient = userRole === "admin" || userRole === "doctor" || userRole === "staff";

  return (
    <Layout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Patients</h1>
            <p className="text-muted-foreground">Manage patient records and information</p>
          </div>
          {canAddPatient && (
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Patient
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add New Patient</DialogTitle>
                  <DialogDescription>Enter patient information below</DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4 py-4">
                  <div className="space-y-2">
                    <Label>Patient ID</Label>
                    <Input
                      value={newPatient.patient_id}
                      onChange={(e) => setNewPatient({ ...newPatient, patient_id: e.target.value })}
                      placeholder="P001"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Full Name</Label>
                    <Input
                      value={newPatient.full_name}
                      onChange={(e) => setNewPatient({ ...newPatient, full_name: e.target.value })}
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Age</Label>
                    <Input
                      type="number"
                      value={newPatient.age}
                      onChange={(e) => setNewPatient({ ...newPatient, age: e.target.value })}
                      placeholder="45"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Gender</Label>
                    <Select value={newPatient.gender} onValueChange={(value) => setNewPatient({ ...newPatient, gender: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Blood Type</Label>
                    <Input
                      value={newPatient.blood_type}
                      onChange={(e) => setNewPatient({ ...newPatient, blood_type: e.target.value })}
                      placeholder="O+"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input
                      value={newPatient.phone}
                      onChange={(e) => setNewPatient({ ...newPatient, phone: e.target.value })}
                      placeholder="+1-555-0123"
                    />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={newPatient.email}
                      onChange={(e) => setNewPatient({ ...newPatient, email: e.target.value })}
                      placeholder="john@example.com"
                    />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label>Address</Label>
                    <Input
                      value={newPatient.address}
                      onChange={(e) => setNewPatient({ ...newPatient, address: e.target.value })}
                      placeholder="123 Main St, City, State"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Emergency Contact</Label>
                    <Input
                      value={newPatient.emergency_contact}
                      onChange={(e) => setNewPatient({ ...newPatient, emergency_contact: e.target.value })}
                      placeholder="Jane Doe"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Emergency Phone</Label>
                    <Input
                      value={newPatient.emergency_phone}
                      onChange={(e) => setNewPatient({ ...newPatient, emergency_phone: e.target.value })}
                      placeholder="+1-555-0124"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Department</Label>
                    <Select value={newPatient.department} onValueChange={(value) => setNewPatient({ ...newPatient, department: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Cardiology">Cardiology</SelectItem>
                        <SelectItem value="Neurology">Neurology</SelectItem>
                        <SelectItem value="Orthopedics">Orthopedics</SelectItem>
                        <SelectItem value="Obstetrics">Obstetrics</SelectItem>
                        <SelectItem value="Emergency">Emergency</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Condition</Label>
                    <Input
                      value={newPatient.condition}
                      onChange={(e) => setNewPatient({ ...newPatient, condition: e.target.value })}
                      placeholder="Hypertension"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select value={newPatient.status} onValueChange={(value: "stable" | "critical" | "recovering" | "discharged") => setNewPatient({ ...newPatient, status: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="stable">Stable</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                        <SelectItem value="recovering">Recovering</SelectItem>
                        <SelectItem value="discharged">Discharged</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Room</Label>
                    <Select value={newPatient.room_id} onValueChange={(value) => setNewPatient({ ...newPatient, room_id: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select room" />
                      </SelectTrigger>
                      <SelectContent>
                        {rooms.map((room) => (
                          <SelectItem key={room.id} value={room.id}>
                            {room.room_number} - {room.room_type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label>Medications (comma separated)</Label>
                    <Input
                      value={newPatient.medications}
                      onChange={(e) => setNewPatient({ ...newPatient, medications: e.target.value })}
                      placeholder="Lisinopril, Aspirin"
                    />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label>Allergies (comma separated)</Label>
                    <Input
                      value={newPatient.allergies}
                      onChange={(e) => setNewPatient({ ...newPatient, allergies: e.target.value })}
                      placeholder="Penicillin, Peanuts"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleAddPatient}>Add Patient</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search patients by name, ID, or department..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-md"
          />
        </div>

        <div className="grid gap-4">
          {filteredPatients.map((patient) => (
            <Card key={patient.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{patient.full_name}</CardTitle>
                    <CardDescription>
                      ID: {patient.patient_id} • Age: {patient.age} • {patient.gender}
                    </CardDescription>
                  </div>
                  <Badge variant={patient.status === "stable" ? "default" : patient.status === "critical" ? "destructive" : "outline"}>
                    {patient.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Department</p>
                    <p className="text-sm">{patient.department}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Condition</p>
                    <p className="text-sm">{patient.condition}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Room</p>
                    <p className="text-sm">{patient.rooms?.room_number || "Not assigned"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Admission</p>
                    <p className="text-sm">{new Date(patient.admission_date).toLocaleDateString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
}
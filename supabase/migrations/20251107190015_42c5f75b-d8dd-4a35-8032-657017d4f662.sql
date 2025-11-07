-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'doctor', 'staff', 'patient');

-- Create enum for patient status
CREATE TYPE public.patient_status AS ENUM ('stable', 'critical', 'recovering', 'discharged');

-- Create enum for bill status
CREATE TYPE public.bill_status AS ENUM ('paid', 'pending', 'overdue');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create user_roles table (CRITICAL: roles MUST be in separate table for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, role)
);

-- Create security definer function to check user role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;

-- Create function to get user primary role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS public.app_role
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role
  FROM public.user_roles
  WHERE user_id = _user_id
  ORDER BY 
    CASE role
      WHEN 'admin' THEN 1
      WHEN 'doctor' THEN 2
      WHEN 'staff' THEN 3
      WHEN 'patient' THEN 4
    END
  LIMIT 1;
$$;

-- Create rooms table
CREATE TABLE public.rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_number TEXT NOT NULL UNIQUE,
  floor INTEGER NOT NULL,
  room_type TEXT NOT NULL,
  is_occupied BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create patients table
CREATE TABLE public.patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id TEXT NOT NULL UNIQUE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  age INTEGER NOT NULL,
  gender TEXT NOT NULL,
  blood_type TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  emergency_contact TEXT,
  emergency_phone TEXT,
  department TEXT NOT NULL,
  condition TEXT NOT NULL,
  status public.patient_status NOT NULL DEFAULT 'stable',
  room_id UUID REFERENCES public.rooms(id) ON DELETE SET NULL,
  admission_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  discharge_date TIMESTAMPTZ,
  assigned_doctor_id UUID,
  medications TEXT[],
  allergies TEXT[],
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create doctors table
CREATE TABLE public.doctors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  employee_id TEXT NOT NULL UNIQUE,
  specialization TEXT NOT NULL,
  department TEXT NOT NULL,
  qualification TEXT NOT NULL,
  experience_years INTEGER NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  schedule TEXT,
  patient_count INTEGER NOT NULL DEFAULT 0,
  rating DECIMAL(2,1) DEFAULT 0.0,
  availability TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create staff table
CREATE TABLE public.staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  employee_id TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL,
  department TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  shift TEXT,
  salary DECIMAL(10,2),
  joined_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create bills table
CREATE TABLE public.bills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  bill_number TEXT NOT NULL UNIQUE,
  date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  description TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  status public.bill_status NOT NULL DEFAULT 'pending',
  paid_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bills ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles"
  ON public.profiles FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
  ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for rooms
CREATE POLICY "Authenticated users can view rooms"
  ON public.rooms FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admin and staff can manage rooms"
  ON public.rooms FOR ALL
  USING (
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'staff')
  );

-- RLS Policies for patients
CREATE POLICY "Patients can view own data"
  ON public.patients FOR SELECT
  USING (
    auth.uid() = user_id OR
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'doctor') OR
    public.has_role(auth.uid(), 'staff')
  );

CREATE POLICY "Admin, doctors, and staff can insert patients"
  ON public.patients FOR INSERT
  WITH CHECK (
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'doctor') OR
    public.has_role(auth.uid(), 'staff')
  );

CREATE POLICY "Admin, doctors, and staff can update patients"
  ON public.patients FOR UPDATE
  USING (
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'doctor') OR
    public.has_role(auth.uid(), 'staff')
  );

CREATE POLICY "Only admins can delete patients"
  ON public.patients FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for doctors
CREATE POLICY "Anyone authenticated can view doctors"
  ON public.doctors FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Doctors can update own profile"
  ON public.doctors FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all doctors"
  ON public.doctors FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for staff
CREATE POLICY "Admins and staff can view staff"
  ON public.staff FOR SELECT
  USING (
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'staff')
  );

CREATE POLICY "Staff can update own profile"
  ON public.staff FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all staff"
  ON public.staff FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for bills
CREATE POLICY "Patients can view own bills"
  ON public.bills FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.patients
      WHERE patients.id = bills.patient_id
      AND patients.user_id = auth.uid()
    ) OR
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'staff')
  );

CREATE POLICY "Admin and staff can manage bills"
  ON public.bills FOR ALL
  USING (
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'staff')
  );

-- Create trigger function for updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Add updated_at triggers
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.rooms
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.patients
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.doctors
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.staff
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.bills
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Create trigger to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    NEW.email
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();





INSERT INTO doctors (user_id, employee_id, email, phone, department, specialization, qualification, experience_years, rating, patient_count, schedule, availability) VALUES
('00000000-0000-0000-0000-000000000001', 'DOC001', 'dr.smith@hospital.com', '+1-555-0101', 'Cardiology', 'Cardiac Surgery', 'MD, FACS', 15, 4.8, 45, '{\"monday\": \"9AM-5PM\", \"wednesday\": \"9AM-5PM\", \"friday\": \"9AM-5PM\"}', 'Available'),
('00000000-0000-0000-0000-000000000002', 'DOC002', 'dr.johnson@hospital.com', '+1-555-0102', 'Neurology', 'Brain Surgery', 'MD, PhD', 12, 4.9, 38, '{\"tuesday\": \"10AM-6PM\", \"thursday\": \"10AM-6PM\"}', 'Available'),
('00000000-0000-0000-0000-000000000003', 'DOC003', 'dr.williams@hospital.com', '+1-555-0103', 'Orthopedics', 'Joint Replacement', 'MD, FAAOS', 10, 4.7, 52, '{\"monday\": \"8AM-4PM\", \"wednesday\": \"8AM-4PM\", \"friday\": \"8AM-4PM\"}', 'Available'),
('00000000-0000-0000-0000-000000000004', 'DOC004', 'dr.brown@hospital.com', '+1-555-0104', 'Pediatrics', 'Child Care', 'MD, FAAP', 8, 4.6, 65, '{\"monday\": \"9AM-5PM\", \"tuesday\": \"9AM-5PM\", \"thursday\": \"9AM-5PM\"}', 'On Leave'),
('00000000-0000-0000-0000-000000000005', 'DOC005', 'dr.davis@hospital.com', '+1-555-0105', 'Emergency', 'Trauma Care', 'MD, FACEP', 20, 4.9, 120, '{\"everyday\": \"24/7 Rotation\"}', 'Available');

-- Insert 5 staff
INSERT INTO staff (user_id, employee_id, email, phone, department, role, shift, salary, joined_date) VALUES
('00000000-0000-0000-0000-000000000011', 'STF001', 'sarah.nurse@hospital.com', '+1-555-0201', 'Cardiology', 'Senior Nurse', 'Morning', 65000, '2020-01-15'),
('00000000-0000-0000-0000-000000000012', 'STF002', 'mike.tech@hospital.com', '+1-555-0202', 'Radiology', 'Lab Technician', 'Evening', 55000, '2021-03-20'),
('00000000-0000-0000-0000-000000000013', 'STF003', 'emily.admin@hospital.com', '+1-555-0203', 'Administration', 'Receptionist', 'Morning', 45000, '2019-06-10'),
('00000000-0000-0000-0000-000000000014', 'STF004', 'james.pharma@hospital.com', '+1-555-0204', 'Pharmacy', 'Pharmacist', 'Night', 70000, '2020-11-05'),
('00000000-0000-0000-0000-000000000015', 'STF005', 'lisa.nurse@hospital.com', '+1-555-0205', 'Emergency', 'Nurse', 'Night', 62000, '2021-08-22');

-- Insert 10 patients
INSERT INTO patients (user_id, patient_id, full_name, age, gender, blood_type, phone, email, address, emergency_contact, emergency_phone, department, condition, status, assigned_doctor_id, room_id, medications, allergies, notes, admission_date) VALUES
(NULL, 'PAT001', 'John Anderson', 45, 'Male', 'O+', '+1-555-1001', 'john.anderson@email.com', '123 Oak Street, Springfield, IL 62701', 'Mary Anderson', '+1-555-1002', 'Cardiology', 'Acute Myocardial Infarction', 'stable', '00000000-0000-0000-0000-000000000001', NULL, '[\"Aspirin 81mg\", \"Metoprolol 50mg\", \"Atorvastatin 40mg\"]', '[\"Penicillin\"]', 'Patient recovering well post-angioplasty', '2025-01-05'),
(NULL, 'PAT002', 'Sarah Mitchell', 62, 'Female', 'A+', '+1-555-1003', 'sarah.mitchell@email.com', '456 Maple Ave, Chicago, IL 60601', 'Robert Mitchell', '+1-555-1004', 'Neurology', 'Ischemic Stroke', 'recovering', '00000000-0000-0000-0000-000000000002', NULL, '[\"Clopidogrel 75mg\", \"Lisinopril 10mg\"]', '[]', 'Speech therapy in progress', '2025-01-10'),
(NULL, 'PAT003', 'Michael Chen', 38, 'Male', 'B+', '+1-555-1005', 'michael.chen@email.com', '789 Pine Road, Boston, MA 02101', 'Lisa Chen', '+1-555-1006', 'Orthopedics', 'Femur Fracture', 'stable', '00000000-0000-0000-0000-000000000003', NULL, '[\"Ibuprofen 600mg\", \"Calcium supplements\"]', '[]', 'Post-surgery day 5, healing well', '2025-01-08'),
(NULL, 'PAT004', 'Emily Rodriguez', 8, 'Female', 'AB+', '+1-555-1007', 'parent.rodriguez@email.com', '321 Elm Street, Austin, TX 78701', 'Maria Rodriguez', '+1-555-1008', 'Pediatrics', 'Severe Pneumonia', 'critical', '00000000-0000-0000-0000-000000000004', NULL, '[\"Amoxicillin 500mg\", \"Albuterol inhaler\"]', '[\"Eggs\", \"Peanuts\"]', 'Requires close monitoring, oxygen support', '2025-01-12'),
(NULL, 'PAT005', 'David Thompson', 55, 'Male', 'O-', '+1-555-1009', 'david.thompson@email.com', '654 Birch Lane, Seattle, WA 98101', 'Jennifer Thompson', '+1-555-1010', 'Emergency', 'Multi-trauma from MVA', 'critical', '00000000-0000-0000-0000-000000000005', NULL, '[\"Morphine\", \"Ceftriaxone 2g\"]', '[]', 'ICU admission, multiple fractures', '2025-01-15'),
(NULL, 'PAT006', 'Lisa Park', 29, 'Female', 'A-', '+1-555-1011', 'lisa.park@email.com', '987 Cedar Court, Portland, OR 97201', 'James Park', '+1-555-1012', 'Cardiology', 'Atrial Fibrillation', 'stable', '00000000-0000-0000-0000-000000000001', NULL, '[\"Warfarin 5mg\", \"Metoprolol 25mg\"]', '[]', 'Awaiting cardioversion procedure', '2025-01-14'),
(NULL, 'PAT007', 'Robert Williams', 71, 'Male', 'B-', '+1-555-1013', 'robert.williams@email.com', '147 Walnut Drive, Denver, CO 80201', 'Susan Williams', '+1-555-1014', 'Neurology', 'Parkinsons Disease', 'stable', '00000000-0000-0000-0000-000000000002', NULL, '[\"Carbidopa-Levodopa\", \"Pramipexole\"]', '[\"Sulfa drugs\"]', 'Long-term management, regular follow-ups', '2024-12-20'),
(NULL, 'PAT008', 'Amanda Garcia', 42, 'Female', 'O+', '+1-555-1015', 'amanda.garcia@email.com', '258 Spruce Street, Miami, FL 33101', 'Carlos Garcia', '+1-555-1016', 'Orthopedics', 'Hip Replacement Surgery', 'recovering', '00000000-0000-0000-0000-000000000003', NULL, '[\"Enoxaparin\", \"Acetaminophen 1000mg\"]', '[]', 'Physical therapy started', '2025-01-11'),
(NULL, 'PAT009', 'Christopher Lee', 5, 'Male', 'A+', '+1-555-1017', 'parent.lee@email.com', '369 Ash Avenue, Phoenix, AZ 85001', 'Grace Lee', '+1-555-1018', 'Pediatrics', 'Acute Appendicitis', 'recovering', '00000000-0000-0000-0000-000000000004', NULL, '[\"Cefazolin\", \"Acetaminophen syrup\"]', '[]', 'Post-appendectomy day 3', '2025-01-13'),
(NULL, 'PAT010', 'Patricia Moore', 67, 'Female', 'AB-', '+1-555-1019', 'patricia.moore@email.com', '741 Poplar Place, Atlanta, GA 30301', 'Richard Moore', '+1-555-1020', 'Emergency', 'Septic Shock', 'critical', '00000000-0000-0000-0000-000000000005', NULL, '[\"Norepinephrine drip\", \"Meropenem 1g\", \"IV fluids\"]', '[\"Latex\"]', 'Critical care, vasopressor support', '2025-01-16');

-- Insert bills for revenue tracking
INSERT INTO bills (patient_id, bill_number, description, amount, status, date, paid_date) VALUES
((SELECT id FROM patients WHERE patient_id = 'PAT001'), 'BILL-2025-001', 'Angioplasty procedure and 5-day admission', 45000, 'paid', '2025-01-10', '2025-01-11'),
((SELECT id FROM patients WHERE patient_id = 'PAT002'), 'BILL-2025-002', 'Stroke treatment and rehabilitation', 38000, 'pending', '2025-01-15', NULL),
((SELECT id FROM patients WHERE patient_id = 'PAT003'), 'BILL-2025-003', 'Femur surgery and physiotherapy', 28000, 'paid', '2025-01-13', '2025-01-14'),
((SELECT id FROM patients WHERE patient_id = 'PAT004'), 'BILL-2025-004', 'Pediatric ICU care and medications', 15000, 'pending', '2025-01-16', NULL),
((SELECT id FROM patients WHERE patient_id = 'PAT005'), 'BILL-2025-005', 'Emergency trauma care and surgery', 65000, 'overdue', '2025-01-16', NULL),
((SELECT id FROM patients WHERE patient_id = 'PAT006'), 'BILL-2025-006', 'Cardiology consultation and tests', 8500, 'paid', '2025-01-15', '2025-01-16'),
((SELECT id FROM patients WHERE patient_id = 'PAT007'), 'BILL-2025-007', 'Neurology follow-up and medications', 5200, 'paid', '2025-01-05', '2025-01-06'),
((SELECT id FROM patients WHERE patient_id = 'PAT008'), 'BILL-2025-008', 'Hip replacement surgery', 52000, 'pending', '2025-01-16', NULL),
((SELECT id FROM patients WHERE patient_id = 'PAT009'), 'BILL-2025-009', 'Appendectomy surgery', 12000, 'paid', '2025-01-16', '2025-01-16'),
((SELECT id FROM patients WHERE patient_id = 'PAT010'), 'BILL-2025-010', 'Critical care and ICU', 48000, 'pending', '2025-01-17', NULL);

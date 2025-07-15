export interface Role {
  id: string
  name: string
  description: string
  permissions: string[]
  created_at: string
  updated_at: string
}

export interface User {
  id: string
  email: string
  name: string
  role_id: string
  is_active: boolean
  role?: Role
  employee?: Employee
  created_at: string
  updated_at: string
}

export interface Usernext {
  id: string
  email: string
  name: string
  role_id: string
  is_active: boolean
  role?: Role
  employee?: employeeNext
  created_at: string
  updated_at: string
  mockPassword?: string 
}

export interface Employee {
  id: string
  user_id: string
  full_name: string
  nik: string
  department: string
  position: string
  phone: string
  photo_url?: string  // ✅ Add this
  address: string
  hire_date: string
  status: "active" | "inactive"
  terminated_at?: string
  user?: User
  created_at: string
  updated_at: string
}

export interface employeeNext{
  id: string
  user_id: string
  full_name: string
  nik: string
  department: string
  position: string
  phone: string
  address: string
  hire_date: string
  status: string
  created_at: string
  updated_at: string
  photo?: string            // ✅ Add this line
  user?: Usernext
}

export interface AttendanceRecordNEXT {
  id: string
  user_id: string             // ✅ Tambahkan ini
  employee_id: string
  date: string
  check_in: string
  check_out?: string
  type: "wfh" | "onsite"
  photo?: string
  notes?: string
  created_at: string
  updated_at: string
  employee?: Employee
}

export interface AttendanceRecord {
  id: string
  employee_id: string
  employee_name: string
  date: string
  checkInTime: string
  checkOutTime?: string
  photo?: string
  location: string
  status: string
  workingHours?: number
  type: "wfh" | "onsite" // ✅ Tambahkan ini
}

export interface AttendanceFilter {
  employee_id?: string
  date_from?: string
  date_to?: string
  type?: "onsite" | "wfh" | ""
  department?: string
}

// types.ts
export interface ProfileData {
  full_name: string
  nik: string
  department: string
  position: string
  phone: string
  address: string
  hire_date: string
  status: string
  photo_url: string
}

export interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  isLoading: boolean
  updateUser: (updatedUser: User) => void // ← Tambahkan ini
}

export interface TodayAttendance {
  user_id: string
  date: string
  type: "wfh" | "onsite"
  check_in: string | null
  check_out: string | null
  photo?: string
  photo_url?: string
}



# Employee Attendance & Monitoring System (Frontend)

This is the **React-based frontend** for a microservices employee attendance and monitoring web application. It supports login, attendance (WFH), employee management, and password change, all aligned with the requirements of the **Fullstack Developer Skill Test**.

## 📌 Use Cases

### 1. **WFH Attendance Application**
Employees can:
- Log in
- Submit attendance with:
  - Date & time stamp
  - Uploaded photo as WFH proof

### 2. **Employee Monitoring (Admin)**
HR Admin can:
- Add/update employee data
- View submitted attendance data (view only)
- Manage roles and change own password

## 📁 Component Structure

```
components/
├── Login.tsx                      # Login screen (redirects based on role)
├── AdminHRDashboard.tsx          # Main HR Admin dashboard
├── EmployeeDashboard.tsx         # Main Employee dashboard
├── RoleManagement.tsx            # Admin-only: manage roles & permissions
├── admin-dashboard/
│   ├── EmployeeManagement.tsx    # Manage employee records
│   ├── AttendanceMonitoring.tsx  # View all attendance records
│   ├── EmployeeProfile.tsx       # View employee profile (admin)
│   └── AdminSecurity.tsx         # Change admin password
└── dashboard/
    ├── AttendanceTab.tsx         # Clock-in/out UI + upload photo
    ├── AttendanceStats.tsx       # Personal attendance stats
    ├── AttendanceHistory.tsx     # View personal history
    ├── ProfileTab.tsx            # View/edit personal profile
    ├── ProfileCard.tsx           # Sub-component of profile
    ├── SecurityTab.tsx           # Change own password (employee)
    └── HeaderBar.tsx             # Dashboard header/navigation
```

## 🔐 Security

- **SecurityTab.tsx (Employee)**: Change password securely
- **AdminSecurity.tsx (Admin)**: Same purpose, scoped for admin usage

## 🔧 Tech Stack

- **React + TypeScript**
- UI framework: (e.g., Tailwind CSS or ShadCN - optional)
- REST API ready for microservices
- Integrates with Express-based backend (Node.js preferred)

## ⚙️ How to Use

1. Clone this repo
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the app:
   ```bash
   npm run dev
   ```
4. Ensure you are connected to the backend microservices (auth, attendance, employee)

## ✅ Features Checklist (Skill Test)

| Feature                                  | Implemented |
|------------------------------------------|-------------|
| Login with role-based dashboard          | ✅           |
| Submit attendance with photo & time      | ✅           |
| Admin view attendance (read-only)        | ✅           |
| Admin manage employee master data        | ✅           |
| Role & permission management             | ✅           |
| Change password (admin & employee)       | ✅           |
| React component structure + API usage    | ✅           |

## 📄 License

This project is for skill test evaluation and demo purposes. Modify as needed.

## ENV needed 
# ─── Server Config ─────────────────────
user 
PORT=4002 
NODE_ENV=development

employee 
PORT=4003 
NODE_ENV=development

attedance 
PORT=4004
NODE_ENV=development

# ─── PostgreSQL Database (Supabase DB) ─
DB_USER=postgres.luqfemndwezixbygklle
DB_PASSWORD=HAW4ADASDyxrt1NZ
DB_HOST=aws-0-ap-southeast-1.pooler.supabase.com
DB_PORT=6543
DB_NAME=postgres



# ─── JWT Settings ──────────────────────
JWT_SECRET=your_super_secret_jwt_key
ACCESS_TOKEN_EXPIRES=15m
REFRESH_TOKEN_EXPIRES=7d
JWT_ACCESS_SECRET=access_secret_key
JWT_REFRESH_SECRET=refresh_secret_key
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
JWT_ISSUER=auth-service
JWT_AUDIENCE=employee-management-api

import { BrowserRouter, Routes, Route } from "react-router-dom"
import LoginPage from "../pages/login"
import EmployeeDashboardPage from "../pages/EmployeeDashboardPage"
import AdminHRDashboard from "../components/AdminHRDashboard"
import PrivateRoute from "./PrivateRoute" // adjust if needed

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route
          path="/employee-dashboard"
          element={
            <PrivateRoute>
              <EmployeeDashboardPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/hr-dashboard"
          element={
            <PrivateRoute>
              <AdminHRDashboard />
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}

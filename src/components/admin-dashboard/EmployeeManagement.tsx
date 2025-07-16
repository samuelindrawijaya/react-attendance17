// EmployeeManagement.tsx (with integrated profile view)
"use client"

import React, { useEffect, useRef, useState } from "react"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Input } from "../../components/ui/input"
import { Textarea } from "../../components/ui/textarea"
import { Badge } from "../../components/ui/badge"
import { Plus, Edit, Trash2, Eye, Search, UserIcon, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react"
import type { Employee, employeeNext } from "../../types"
import { Label } from "@radix-ui/react-label"
import EmployeeProfile from "./EmployeeProfile"
import axiosInstance from "../../lib/axiosInstance"

interface EmployeeManagementProps {
    onViewProfile?: (employee: employeeNext) => void
}

interface ValidationErrors {
    [key: string]: string
}

// const staticRoles: Role[] = [
//     { id: "1", name: "Admin", description: "", permissions: [], created_at: "", updated_at: "" },
//     { id: "2", name: "Employee", description: "", permissions: [], created_at: "", updated_at: "" },
//     { id: "3", name: "HR", description: "", permissions: [], created_at: "", updated_at: "" }
// ]

// Validation functions matching Joi schema
const validateEmail = (email: string): string | null => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email || !email.trim()) return "Email is required"
    if (!emailRegex.test(email.toLowerCase())) return "Email must be valid"
    return null
}

const validatePassword = (password: string): string | null => {
    if (!password || !password.trim()) return "Password is required"
    if (password.trim().length < 6) return "Password must be at least 6 characters"
    return null
}

const validateName = (name: string): string | null => {
    if (!name || !name.trim()) return "Name is required"
    if (name.trim().length < 2) return "Name must be at least 2 characters"
    if (name.trim().length > 100) return "Name must be less than 100 characters"
    return null
}

const validateFullName = (fullName: string): string | null => {
    if (!fullName || !fullName.trim()) return "Full name is required"
    if (fullName.trim().length < 2) return "Full name must be at least 2 characters"
    if (fullName.trim().length > 100) return "Full name must be less than 100 characters"
    return null
}

const validateNIK = (nik: string): string | null => {
    if (!nik || !nik.trim()) return "NIK is required"
    const nikRegex = /^[a-zA-Z0-9]+$/
    if (!nikRegex.test(nik)) return "NIK must be alphanumeric"
    if (nik.length < 6) return "NIK must be at least 6 characters"
    if (nik.length > 20) return "NIK must be less than 20 characters"
    return null
}

const validatePhone = (phone: string): string | null => {
    if (!phone || !phone.trim()) return "Phone is required"
    const phoneRegex = /^[0-9+\-() ]{8,20}$/
    if (!phoneRegex.test(phone)) return "Phone must be a valid format (digits, +, -, () allowed)"
    return null
}

const validateDepartment = (department: string): string | null => {
    if (!department || !department.trim()) return "Department is required"
    if (department.trim().length < 2) return "Department must be at least 2 characters"
    return null
}

const validatePosition = (position: string): string | null => {
    if (!position || !position.trim()) return "Position is required"
    if (position.trim().length < 2) return "Position must be at least 2 characters"
    return null
}

const validateHireDate = (hireDate: string): string | null => {
    if (!hireDate || !hireDate.trim()) return "Hire date is required"
    const date = new Date(hireDate)
    if (isNaN(date.getTime())) return "Hire date must be a valid date"
    return null
}

const validateStatus = (status: string): string | null => {
    if (!status) return null // Optional field
    if (!['active', 'inactive'].includes(status)) return "Status must be 'active' or 'inactive'"
    return null
}

// Edit validation (optional fields)
const validateNameEdit = (name: string): string | null => {
    if (!name) return null // Optional in edit mode
    if (name.trim().length < 2) return "Name must be at least 2 characters"
    if (name.trim().length > 100) return "Name must be less than 100 characters"
    return null
}

const validateNIKEdit = (nik: string): string | null => {
    if (!nik) return null // Optional in edit mode
    const nikRegex = /^[a-zA-Z0-9]+$/
    if (!nikRegex.test(nik)) return "NIK must be alphanumeric"
    if (nik.length < 6) return "NIK must be at least 6 characters"
    if (nik.length > 20) return "NIK must be less than 20 characters"
    return null
}

const validatePhoneEdit = (phone: string): string | null => {
    if (!phone) return null // Optional in edit mode
    const phoneRegex = /^[0-9+\-() ]{8,20}$/
    if (!phoneRegex.test(phone)) return "Phone format invalid"
    return null
}

const validateDepartmentEdit = (department: string): string | null => {
    if (!department) return null // Optional in edit mode
    if (department.trim().length < 2) return "Department must be at least 2 characters"
    return null
}

const validatePositionEdit = (position: string): string | null => {
    if (!position) return null // Optional in edit mode
    if (position.trim().length < 2) return "Position must be at least 2 characters"
    return null
}

const validateHireDateEdit = (hireDate: string): string | null => {
    if (!hireDate) return null // Optional in edit mode
    const date = new Date(hireDate)
    if (isNaN(date.getTime())) return "Hire date must be a valid date"
    return null
}

export default function EmployeeManagement({ onViewProfile }: EmployeeManagementProps) {
    const [employees, setEmployees] = useState<Employee[]>([])
    const [searchTerm, setSearchTerm] = useState("")
    const [showForm, setShowForm] = useState(false)
    const [editingEmployee, setEditingEmployee] = useState<employeeNext | null>(null)
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
    const [formData, setFormData] = useState({
        name: "",
        full_name: "",
        nik: "",
        email: "",
        password: "",
        department: "",
        position: "",
        phone: "",
        address: "",
        hire_date: "",
        role_id: "2",
        photo: "",
        user_id: "",
        status: "",
    })
    const [errors, setErrors] = useState<ValidationErrors>({})
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage] = useState(5) // You can make this configurable

    const photoInputRef = useRef<HTMLInputElement>(null)
    const [users, setUsers] = useState<{ id: string; name: string; email: string }[]>([])
    const [photoFile, setPhotoFile] = useState<File | null>(null)

    useEffect(() => {
        fetchEmployees()
        fetchUsers()
    }, [])

    const fetchUsers = async () => {
        try {

            const res = await  axiosInstance.get("http://localhost:4002/api/auth/get-all-users");

            setUsers(res.data.data || [])
            console.log(res.data.data)
        } catch (err) {
            console.error("Failed to fetch users", err)
        }
    }

    const fetchEmployees = async () => {
        try {
            const res = await  axiosInstance.get("http://localhost:4003/api/employee");
            const employeeArray = res.data?.data?.data || [];
            setEmployees(employeeArray);
        } catch (err) {
            console.error("Failed to fetch employees", err);
            setEmployees([]);
        }
    };

    const handleViewProfile = (employee: Employee) => {
        setSelectedEmployee(employee)
        // If there's an external onViewProfile handler, call it too
        if (onViewProfile) {
            onViewProfile(employee)
        }
    }

    const handleBackToList = () => {
        setSelectedEmployee(null)
    }

    const validateForm = (): boolean => {
        const newErrors: ValidationErrors = {}
        const isEditing = !!editingEmployee

        if (isEditing) {
            // Edit validation (optional fields)
            const fullNameError = validateNameEdit(formData.full_name)
            if (fullNameError) newErrors.full_name = fullNameError

            const nikError = validateNIKEdit(formData.nik)
            if (nikError) newErrors.nik = nikError

            const phoneError = validatePhoneEdit(formData.phone)
            if (phoneError) newErrors.phone = phoneError

            const departmentError = validateDepartmentEdit(formData.department)
            if (departmentError) newErrors.department = departmentError

            const positionError = validatePositionEdit(formData.position)
            if (positionError) newErrors.position = positionError

            const hireDateError = validateHireDateEdit(formData.hire_date)
            if (hireDateError) newErrors.hire_date = hireDateError

            const statusError = validateStatus(formData.status)
            if (statusError) newErrors.status = statusError

        } else {
            // Create validation (required fields)
            const nameError = validateName(formData.name)
            if (nameError) newErrors.name = nameError

            const emailError = validateEmail(formData.email)
            if (emailError) newErrors.email = emailError

            const passwordError = validatePassword(formData.password)
            if (passwordError) newErrors.password = passwordError

            const fullNameError = validateFullName(formData.full_name)
            if (fullNameError) newErrors.full_name = fullNameError

            const nikError = validateNIK(formData.nik)
            if (nikError) newErrors.nik = nikError

            const phoneError = validatePhone(formData.phone)
            if (phoneError) newErrors.phone = phoneError

            const departmentError = validateDepartment(formData.department)
            if (departmentError) newErrors.department = departmentError

            const positionError = validatePosition(formData.position)
            if (positionError) newErrors.position = positionError

            const hireDateError = validateHireDate(formData.hire_date)
            if (hireDateError) newErrors.hire_date = hireDateError
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        
        if (!validateForm()) {
            return
        }

        setIsSubmitting(true)
        const form = new FormData();

        const keysToInclude = [
            "full_name",
            "nik",
            "phone",
            "department",
            "position",
            "address",
            "hire_date",
            "status",
        ]

        // Add name, email, password only for create
        if (!editingEmployee) {
            form.append("name", formData.name)
            form.append("email", formData.email.toLowerCase())
            form.append("password", formData.password)
        }

        keysToInclude.forEach((key) => {
            const val = formData[key as keyof typeof formData]
            if (val !== undefined && val !== "") {
                form.append(key, val)
            }
        })

        if (photoFile) {
            form.append("photo", photoFile)
        }
        try {
           if (editingEmployee) {
                await axiosInstance.put(`http://localhost:4003/api/employee/${editingEmployee.id}`, form);
            } else {
                await axiosInstance.post(`http://localhost:4003/api/employee`, form);
            }
            alert("Success")
            resetForm()
            fetchEmployees()
        } catch (err) {
            console.error(err)
            alert(err)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleEdit = (employee: Employee) => {
        setEditingEmployee(employee)
        const foundUser = users.find((u) => u.id === employee.user_id)
        setFormData({
            name: foundUser?.name || "",
            full_name: employee.full_name,
            nik: employee.nik,
            email: foundUser?.email || "",
            password: "", // Never populate password in edit mode
            phone: employee.phone || "",
            department: employee.department,
            position: employee.position,
            address: employee.address,
            hire_date: employee.hire_date?.split("T")[0] || "",
            role_id: "2",
            photo: employee.photo_url || "",
            user_id: employee.user_id || "",
            status: employee.status || ""
        });
        setErrors({}) // Clear errors when editing
        setShowForm(true)
    }

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setPhotoFile(file);
            const reader = new FileReader();
            reader.onload = (event) => {
                setFormData((prev) => ({
                    ...prev,
                    photo: event.target?.result as string,
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this employee?")) return
        try {
            await axiosInstance.delete(`http://localhost:4003/api/employee/${id}`);
            alert("Deleted")
            fetchEmployees()
        } catch (err) {
            console.error("Delete failed:", err)
            alert("Failed to delete")
        }
    }

    const handleResetEmployeePassword = async (userId?: string, email?: string) => {
        if (!userId || !email) return alert("Invalid user data")

        const confirmed = confirm(`Reset password for ${email} to 'password123'?`)
        if (!confirmed) return

        try {
            await axiosInstance.post(`http://localhost:4002/api/auth/reset-password`, {
                user_id: userId,
                new_password: "password123" + email
            });
            alert(`Password for ${email} has been reset to 'password123'`)
        } catch (err) {
            console.error("Reset password failed:", err)
            alert(`Failed to reset password for ${email}`)
        }
    }

    const resetForm = () => {
        setFormData({
            name: "",
            full_name: "",
            nik: "",
            email: "",
            password: "",
            department: "",
            position: "",
            phone: "",
            address: "",
            hire_date: "",
            role_id: "2",
            photo: "",
            user_id: "",
            status: ""
        })
        setErrors({})
        setShowForm(false)
        setEditingEmployee(null)
        setPhotoFile(null)
    }

    const filteredEmployees = employees.filter(
        (emp) =>
            emp.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            emp.nik.toLowerCase().includes(searchTerm.toLowerCase()) ||
            emp.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
            emp.position.toLowerCase().includes(searchTerm.toLowerCase())
    )

    // Pagination calculations
    const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const currentEmployees = filteredEmployees.slice(startIndex, endIndex)

    // Reset to first page when search changes
    useEffect(() => {
        setCurrentPage(1)
    }, [searchTerm])

    const ErrorMessage = ({ error }: { error?: string }) => {
        if (!error) return null
        return (
            <div className="flex items-center gap-1 text-red-600 text-sm mt-1">
                <AlertCircle className="h-4 w-4" />
                {error}
            </div>
        )
    }

    // If an employee is selected, show their profile
    if (selectedEmployee) {
        return <EmployeeProfile employee={selectedEmployee} onBack={handleBackToList} />
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold">Employee Management</h2>
                    <p className="text-gray-600">Manage employee data</p>
                </div>
                <Button onClick={() => setShowForm(true)}>
                    <Plus className="h-4 w-4 mr-2" /> Add Employee
                </Button>
            </div>

            <div className="flex items-center space-x-2">
                <Search className="h-4 w-4 text-gray-400" />
                <Input placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>

            {showForm && (
                <Card>
                    <CardHeader>
                        <CardTitle>{editingEmployee ? "Edit Employee" : "Add Employee"}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="flex flex-col md:flex-row gap-6">
                                {/* Photo upload */}
                                <div className="flex flex-col items-center space-y-2">
                                    <div className="h-24 w-24 rounded-full overflow-hidden bg-gray-100 flex justify-center items-center">
                                        {formData.photo ? (
                                            <img src={formData.photo} alt="profile" className="object-cover w-full h-full" />
                                        ) : (
                                            <UserIcon className="w-12 h-12 text-gray-400" />
                                        )}
                                    </div>
                                    <input
                                        type="file"
                                        ref={photoInputRef}
                                        onChange={handlePhotoChange}
                                        accept="image/*"
                                    />
                                    <p className="text-sm text-gray-500">Click to upload photo</p>
                                </div>

                                {/* Form fields */}
                                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Name field - only for create */}
                                    {!editingEmployee && (
                                        <div>
                                            <Label>Name *</Label>
                                            <Input 
                                                value={formData.name} 
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                                                className={errors.name ? "border-red-500" : ""}
                                            />
                                            <ErrorMessage error={errors.name} />
                                        </div>
                                    )}

                                    <div>
                                        <Label>Full Name {!editingEmployee && "*"}</Label>
                                        <Input 
                                            value={formData.full_name} 
                                            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })} 
                                            className={errors.full_name ? "border-red-500" : ""}
                                        />
                                        <ErrorMessage error={errors.full_name} />
                                    </div>

                                    <div>
                                        <Label>Employee ID (NIK) {!editingEmployee && "*"}</Label>
                                        <Input 
                                            value={formData.nik} 
                                            onChange={(e) => setFormData({ ...formData, nik: e.target.value })} 
                                            className={errors.nik ? "border-red-500" : ""}
                                        />
                                        <ErrorMessage error={errors.nik} />
                                    </div>

                                    {/* Email field - only for create */}
                                    {!editingEmployee && (
                                        <div>
                                            <Label>Email *</Label>
                                            <Input 
                                                type="email"
                                                value={formData.email} 
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })} 
                                                className={errors.email ? "border-red-500" : ""}
                                            />
                                            <ErrorMessage error={errors.email} />
                                        </div>
                                    )}

                                    {/* Password field - only for create */}
                                    {!editingEmployee && (
                                        <div>
                                            <Label>Password *</Label>
                                            <Input 
                                                type="password"
                                                value={formData.password} 
                                                onChange={(e) => setFormData({ ...formData, password: e.target.value })} 
                                                className={errors.password ? "border-red-500" : ""}
                                            />
                                            <ErrorMessage error={errors.password} />
                                        </div>
                                    )}

                                    <div>
                                        <Label>Phone {!editingEmployee && "*"}</Label>
                                        <Input 
                                            value={formData.phone} 
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })} 
                                            className={errors.phone ? "border-red-500" : ""}
                                        />
                                        <ErrorMessage error={errors.phone} />
                                    </div>

                                    <div>
                                        <Label>Department {!editingEmployee && "*"}</Label>
                                        <Input 
                                            value={formData.department} 
                                            onChange={(e) => setFormData({ ...formData, department: e.target.value })} 
                                            className={errors.department ? "border-red-500" : ""}
                                        />
                                        <ErrorMessage error={errors.department} />
                                    </div>

                                    <div>
                                        <Label>Position {!editingEmployee && "*"}</Label>
                                        <Input 
                                            value={formData.position} 
                                            onChange={(e) => setFormData({ ...formData, position: e.target.value })} 
                                            className={errors.position ? "border-red-500" : ""}
                                        />
                                        <ErrorMessage error={errors.position} />
                                    </div>

                                    <div>
                                        <Label>Hire Date {!editingEmployee && "*"}</Label>
                                        <Input 
                                            type="date" 
                                            value={formData.hire_date} 
                                            onChange={(e) => setFormData({ ...formData, hire_date: e.target.value })} 
                                            className={errors.hire_date ? "border-red-500" : ""}
                                        />
                                        <ErrorMessage error={errors.hire_date} />
                                    </div>
                                </div>
                            </div>

                            {/* Address */}
                            <div>
                                <Label>Address</Label>
                                <Textarea 
                                    value={formData.address} 
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })} 
                                />
                            </div>

                            <div className="flex gap-3">
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? "Saving..." : editingEmployee ? "Update Employee" : "Create Employee"}
                                </Button>
                                <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
                                {editingEmployee?.user && (
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        onClick={() =>
                                            handleResetEmployeePassword(editingEmployee.user?.id, editingEmployee.user?.email)
                                        }
                                    >
                                        Reset Password
                                    </Button>
                                )}
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardContent className="p-0">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="p-4 text-left">Name</th>
                                <th className="p-4 text-left">Department</th>
                                <th className="p-4 text-left">Position</th>
                                <th className="p-4 text-left">Status</th>
                                <th className="p-4 text-left">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentEmployees.map((emp) => (
                                <tr key={emp.id} className="border-b">
                                    <td className="p-4">{emp.full_name}</td>
                                    <td className="p-4">{emp.department}</td>
                                    <td className="p-4">{emp.position}</td>
                                    <td className="p-4">
                                        <Badge variant={emp.status === "active" ? "default" : "secondary"}>{emp.status}</Badge>
                                    </td>
                                    <td className="p-4 space-x-2">
                                        <Button size="sm" variant="outline" onClick={() => handleViewProfile(emp)}>
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                        <Button size="sm" variant="outline" onClick={() => handleEdit(emp)}>
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button size="sm" variant="outline" onClick={() => handleDelete(emp.id)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    
                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between p-4 border-t">
                            <div className="text-sm text-gray-600">
                                Showing {startIndex + 1} to {Math.min(endIndex, filteredEmployees.length)} of {filteredEmployees.length} employees
                            </div>
                            
                            <div className="flex items-center space-x-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                
                                {/* Page numbers */}
                                <div className="flex space-x-1">
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
                                        // Show first page, last page, current page, and pages around current
                                        if (
                                            page === 1 ||
                                            page === totalPages ||
                                            (page >= currentPage - 1 && page <= currentPage + 1)
                                        ) {
                                            return (
                                                <Button
                                                    key={page}
                                                    variant={currentPage === page ? "default" : "outline"}
                                                    size="sm"
                                                    onClick={() => setCurrentPage(page)}
                                                    className="w-8 h-8 p-0"
                                                >
                                                    {page}
                                                </Button>
                                            )
                                        } else if (
                                            page === currentPage - 2 ||
                                            page === currentPage + 2
                                        ) {
                                            return <span key={page} className="px-2">...</span>
                                        }
                                        return null
                                    })}
                                </div>
                                
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
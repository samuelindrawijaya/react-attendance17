// "use client"

// import type React from "react"

// import { useState } from "react"
// import { Button } from "@/components/ui/button"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { Textarea } from "@/components/ui/textarea"
// import { Badge } from "@/components/ui/badge"
// import { Plus, Edit, Trash2, Shield } from "lucide-react"
// import type { Role } from "@/types"

// const mockRoles: Role[] = [
//   {
//     id: "1",
//     name: "Admin",
//     description: "Full system access",
//     permissions: ["user.create", "user.read", "user.update", "user.delete", "role.manage", "attendance.view_all"],
//     created_at: "2024-01-01T00:00:00Z",
//     updated_at: "2024-01-01T00:00:00Z",
//   },
//   {
//     id: "2",
//     name: "Employee",
//     description: "Basic employee access",
//     permissions: ["attendance.create", "attendance.read_own", "profile.read", "profile.update"],
//     created_at: "2024-01-01T00:00:00Z",
//     updated_at: "2024-01-01T00:00:00Z",
//   },
//   {
//     id: "3",
//     name: "HR",
//     description: "HR management access",
//     permissions: ["employee.create", "employee.read", "employee.update", "attendance.view_all"],
//     created_at: "2024-01-01T00:00:00Z",
//     updated_at: "2024-01-01T00:00:00Z",
//   },
// ]

// const availablePermissions = [
//   "user.create",
//   "user.read",
//   "user.update",
//   "user.delete",
//   "role.manage",
//   "employee.create",
//   "employee.read",
//   "employee.update",
//   "employee.delete",
//   "attendance.create",
//   "attendance.read_own",
//   "attendance.view_all",
//   "attendance.update",
//   "profile.read",
//   "profile.update",
// ]

// export default function RoleManagement() {
//   const [roles, setRoles] = useState<Role[]>(mockRoles)
//   const [showForm, setShowForm] = useState(false)
//   const [editingRole, setEditingRole] = useState<Role | null>(null)
//   const [formData, setFormData] = useState({
//     name: "",
//     description: "",
//     permissions: [] as string[],
//   })

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault()

//     if (editingRole) {
//       // Update existing role
//       setRoles(
//         roles.map((role) =>
//           role.id === editingRole.id ? { ...role, ...formData, updated_at: new Date().toISOString() } : role,
//         ),
//       )
//     } else {
//       // Create new role
//       const newRole: Role = {
//         id: Date.now().toString(),
//         ...formData,
//         created_at: new Date().toISOString(),
//         updated_at: new Date().toISOString(),
//       }
//       setRoles([...roles, newRole])
//     }

//     resetForm()
//   }

//   const resetForm = () => {
//     setFormData({ name: "", description: "", permissions: [] })
//     setShowForm(false)
//     setEditingRole(null)
//   }

//   const handleEdit = (role: Role) => {
//     setEditingRole(role)
//     setFormData({
//       name: role.name,
//       description: role.description,
//       permissions: role.permissions,
//     })
//     setShowForm(true)
//   }

//   const handleDelete = (id: string) => {
//     if (confirm("Are you sure you want to delete this role?")) {
//       setRoles(roles.filter((role) => role.id !== id))
//     }
//   }

//   const togglePermission = (permission: string) => {
//     setFormData((prev) => ({
//       ...prev,
//       permissions: prev.permissions.includes(permission)
//         ? prev.permissions.filter((p) => p !== permission)
//         : [...prev.permissions, permission],
//     }))
//   }

//   return (
//     <div className="space-y-6">
//       <div className="flex justify-between items-center">
//         <div>
//           <h2 className="text-2xl font-bold">Role Management</h2>
//           <p className="text-gray-600">Manage system roles and permissions</p>
//         </div>
//         <Button onClick={() => setShowForm(true)}>
//           <Plus className="h-4 w-4 mr-2" />
//           Add Role
//         </Button>
//       </div>

//       {/* Role Form */}
//       {showForm && (
//         <Card>
//           <CardHeader>
//             <CardTitle>{editingRole ? "Edit Role" : "Create New Role"}</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <form onSubmit={handleSubmit} className="space-y-4">
//               <div className="grid grid-cols-2 gap-4">
//                 <div>
//                   <Label htmlFor="name">Role Name</Label>
//                   <Input
//                     id="name"
//                     value={formData.name}
//                     onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
//                     required
//                   />
//                 </div>
//                 <div>
//                   <Label htmlFor="description">Description</Label>
//                   <Textarea
//                     id="description"
//                     value={formData.description}
//                     onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
//                     required
//                   />
//                 </div>
//               </div>

//               <div>
//                 <Label>Permissions</Label>
//                 <div className="grid grid-cols-3 gap-2 mt-2">
//                   {availablePermissions.map((permission) => (
//                     <div key={permission} className="flex items-center space-x-2">
//                       <input
//                         type="checkbox"
//                         id={permission}
//                         checked={formData.permissions.includes(permission)}
//                         onChange={() => togglePermission(permission)}
//                         className="rounded"
//                       />
//                       <Label htmlFor={permission} className="text-sm">
//                         {permission}
//                       </Label>
//                     </div>
//                   ))}
//                 </div>
//               </div>

//               <div className="flex space-x-2">
//                 <Button type="submit">{editingRole ? "Update Role" : "Create Role"}</Button>
//                 <Button type="button" variant="outline" onClick={resetForm}>
//                   Cancel
//                 </Button>
//               </div>
//             </form>
//           </CardContent>
//         </Card>
//       )}

//       {/* Roles List */}
//       <div className="grid gap-4">
//         {roles.map((role) => (
//           <Card key={role.id}>
//             <CardHeader>
//               <div className="flex justify-between items-start">
//                 <div>
//                   <CardTitle className="flex items-center">
//                     <Shield className="h-5 w-5 mr-2 text-blue-600" />
//                     {role.name}
//                   </CardTitle>
//                   <CardDescription>{role.description}</CardDescription>
//                 </div>
//                 <div className="flex space-x-2">
//                   <Button size="sm" variant="outline" onClick={() => handleEdit(role)}>
//                     <Edit className="h-4 w-4" />
//                   </Button>
//                   <Button size="sm" variant="outline" onClick={() => handleDelete(role.id)}>
//                     <Trash2 className="h-4 w-4" />
//                   </Button>
//                 </div>
//               </div>
//             </CardHeader>
//             <CardContent>
//               <div>
//                 <p className="text-sm font-medium mb-2">Permissions:</p>
//                 <div className="flex flex-wrap gap-1">
//                   {role.permissions.map((permission) => (
//                     <Badge key={permission} variant="secondary" className="text-xs">
//                       {permission}
//                     </Badge>
//                   ))}
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//         ))}
//       </div>
//     </div>
//   )
// }

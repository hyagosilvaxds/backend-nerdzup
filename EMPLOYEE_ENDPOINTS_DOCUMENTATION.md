# Employee Management API Documentation

This document provides comprehensive documentation for all employee-related endpoints, including permission management.

## Authentication
All endpoints require JWT authentication. Include the token in the `Authorization` header:
```
Authorization: Bearer <your-jwt-token>
```

## Base URL
```
http://localhost:4000/employees
```

---

## 1. Create Employee
**POST** `/employees`

### Description
Creates a new employee account with user credentials and employee profile information.

### Required Roles
- `ADMIN`

### Required Permissions
- `WRITE_EMPLOYEES`

### Request Body
```json
{
  "email": "john.doe@company.com",
  "password": "secure_password123",
  "name": "John Doe",
  "position": "Marketing Manager",
  "department": "Marketing",
  "phone": "+5511999999999",
  "hireDate": "2024-01-15T00:00:00.000Z",
  "salary": 5000.00,
  "isActive": true,
  "role": "EMPLOYEE",
  "permissions": [
    "READ_CLIENTS",
    "WRITE_CLIENTS"
  ]
}
```

### Request Body Fields
- `email` (string, required) - Employee email address
- `password` (string, required) - Initial password for the employee
- `name` (string, required) - Full name of the employee
- `position` (string, required) - Job position/title
- `department` (string, optional) - Department name
- `phone` (string, optional) - Phone number
- `hireDate` (string, optional) - Hire date (ISO 8601 format, defaults to current date)
- `salary` (number, optional) - Salary amount
- `isActive` (boolean, optional) - Account status (defaults to true)
- `role` (string, optional) - User role: `"ADMIN"` or `"EMPLOYEE"` (defaults to `"EMPLOYEE"`)
- `permissions` (array, optional) - Array of initial permissions to assign

### Response
```json
{
  "id": "user_id",
  "email": "john.doe@company.com",
  "role": "EMPLOYEE",
  "isActive": true,
  "profilePhoto": null,
  "createdAt": "2024-01-15T09:00:00.000Z",
  "updatedAt": "2024-01-15T09:00:00.000Z",
  "employee": {
    "id": "employee_id",
    "userId": "user_id",
    "name": "John Doe",
    "position": "Marketing Manager",
    "department": "Marketing",
    "phone": "+5511999999999",
    "hireDate": "2024-01-15T00:00:00.000Z",
    "salary": "5000.00",
    "isActive": true,
    "createdAt": "2024-01-15T09:00:00.000Z",
    "updatedAt": "2024-01-15T09:00:00.000Z",
    "permissions": [
      {
        "id": "permission_id",
        "employeeId": "employee_id",
        "permission": "READ_CLIENTS",
        "grantedAt": "2024-01-15T09:00:00.000Z",
        "grantedBy": "admin_user_id"
      },
      {
        "id": "permission_id_2",
        "employeeId": "employee_id",
        "permission": "WRITE_CLIENTS",
        "grantedAt": "2024-01-15T09:00:00.000Z",
        "grantedBy": "admin_user_id"
      }
    ]
  }
}
```

### Error Responses
- `409` - User with this email already exists
- `400` - Invalid data format
- `400` - Only ADMIN and EMPLOYEE roles are allowed

### Creating Administrators
To create a user with administrator privileges, set the `role` field to `"ADMIN"`:

```json
{
  "email": "admin@company.com",
  "password": "admin_password123",
  "name": "Jane Smith",
  "position": "System Administrator",
  "department": "IT",
  "role": "ADMIN",
  "isActive": true
}
```

**Important Notes:**
- Only existing ADMINs can create new ADMIN users
- ADMIN users have full system access and don't require specific permissions
- The system validates that only `ADMIN` or `EMPLOYEE` roles can be assigned
- CLIENT role is not allowed through the employee creation endpoint

---

## 2. Get All Employees and Admins
**GET** `/employees`

### Description
Retrieves a list of all employees and administrators with their profile information and permissions. Results are ordered by role (ADMINs first, then EMPLOYEEs) and then by name alphabetically.

### Required Roles
- `ADMIN`
- `EMPLOYEE`

### Required Permissions
- `READ_EMPLOYEES`

### Response
```json
[
  {
    "id": "admin_employee_id",
    "userId": "admin_user_id",
    "name": "Jane Smith",
    "position": "System Administrator",
    "department": "IT",
    "phone": "+5511777777777",
    "hireDate": "2023-01-01T00:00:00.000Z",
    "salary": "8000.00",
    "isActive": true,
    "createdAt": "2023-01-01T09:00:00.000Z",
    "updatedAt": "2024-01-15T09:00:00.000Z",
    "user": {
      "id": "admin_user_id",
      "email": "jane.admin@company.com",
      "role": "ADMIN",
      "isActive": true,
      "profilePhoto": "/uploads/profile-photos/admin-photo.jpg",
      "createdAt": "2023-01-01T09:00:00.000Z",
      "updatedAt": "2024-01-15T09:00:00.000Z"
    },
    "permissions": []
  },
  {
    "id": "employee_id",
    "userId": "user_id",
    "name": "John Doe",
    "position": "Marketing Manager",
    "department": "Marketing",
    "phone": "+5511999999999",
    "hireDate": "2024-01-15T00:00:00.000Z",
    "salary": "5000.00",
    "isActive": true,
    "createdAt": "2024-01-15T09:00:00.000Z",
    "updatedAt": "2024-01-15T09:00:00.000Z",
    "user": {
      "id": "user_id",
      "email": "john.doe@company.com",
      "role": "EMPLOYEE",
      "isActive": true,
      "profilePhoto": null,
      "createdAt": "2024-01-15T09:00:00.000Z",
      "updatedAt": "2024-01-15T09:00:00.000Z"
    },
    "permissions": [
      {
        "id": "permission_id",
        "employeeId": "employee_id",
        "permission": "READ_CLIENTS",
        "grantedAt": "2024-01-15T10:00:00.000Z",
        "grantedBy": "admin_user_id"
      }
    ]
  }
]
```

---

## 3. Get Available Permissions
**GET** `/employees/permissions`

### Description
Retrieves all available permissions that can be assigned to employees.

### Required Roles
- `ADMIN`
- `EMPLOYEE`

### Response
```json
{
  "permissions": [
    "READ_CLIENTS",
    "WRITE_CLIENTS",
    "DELETE_CLIENTS",
    "READ_EMPLOYEES",
    "WRITE_EMPLOYEES",
    "DELETE_EMPLOYEES",
    "READ_CAMPAIGNS",
    "WRITE_CAMPAIGNS",
    "DELETE_CAMPAIGNS",
    "MANAGE_PERMISSIONS"
  ]
}
```

---

## 4. Get Single Employee
**GET** `/employees/:id`

### Description
Retrieves detailed information about a specific employee, including their permissions.

### Required Roles
- `ADMIN`
- `EMPLOYEE`

### Required Permissions
- `READ_EMPLOYEES`

### URL Parameters
- `id` (string) - Employee ID

### Response
```json
{
  "id": "employee_id",
  "userId": "user_id",
  "name": "John Doe",
  "position": "Marketing Manager",
  "department": "Marketing",
  "phone": "+5511999999999",
  "hireDate": "2024-01-15T00:00:00.000Z",
  "salary": "5000.00",
  "isActive": true,
  "createdAt": "2024-01-15T09:00:00.000Z",
  "updatedAt": "2024-01-15T09:00:00.000Z",
  "user": {
    "id": "user_id",
    "email": "john.doe@company.com",
    "role": "EMPLOYEE",
    "isActive": true,
    "profilePhoto": null,
    "createdAt": "2024-01-15T09:00:00.000Z",
    "updatedAt": "2024-01-15T09:00:00.000Z"
  },
  "permissions": [
    {
      "id": "permission_id",
      "employeeId": "employee_id",
      "permission": "READ_CLIENTS",
      "grantedAt": "2024-01-15T10:00:00.000Z",
      "grantedBy": "admin_user_id"
    },
    {
      "id": "permission_id_2",
      "employeeId": "employee_id",
      "permission": "WRITE_CLIENTS",
      "grantedAt": "2024-01-15T10:00:00.000Z",
      "grantedBy": "admin_user_id"
    }
  ],
  "campaigns": [],
  "taskAssignments": []
}
```

### Error Responses
- `404` - Employee not found

---

## 5. Update Employee
**PATCH** `/employees/:id`

### Description
Updates employee information. Can update profile data and account status.

### Required Roles
- `ADMIN`

### Required Permissions
- `WRITE_EMPLOYEES`

### URL Parameters
- `id` (string) - Employee ID

### Request Body
```json
{
  "name": "John Smith",
  "position": "Senior Marketing Manager",
  "department": "Marketing & Communications",
  "phone": "+5511888888888",
  "salary": 6000.00,
  "isActive": true
}
```

### Request Body Fields (all optional)
- `name` (string) - Full name
- `position` (string) - Job position/title
- `department` (string) - Department name
- `phone` (string) - Phone number
- `salary` (number) - Salary amount
- `isActive` (boolean) - Account status

### Response
```json
{
  "id": "employee_id",
  "userId": "user_id",
  "name": "John Smith",
  "position": "Senior Marketing Manager",
  "department": "Marketing & Communications",
  "phone": "+5511888888888",
  "hireDate": "2024-01-15T00:00:00.000Z",
  "salary": "6000.00",
  "isActive": true,
  "createdAt": "2024-01-15T09:00:00.000Z",
  "updatedAt": "2024-01-16T14:30:00.000Z",
  "user": {
    "id": "user_id",
    "email": "john.doe@company.com",
    "role": "EMPLOYEE",
    "isActive": true,
    "profilePhoto": null,
    "createdAt": "2024-01-15T09:00:00.000Z",
    "updatedAt": "2024-01-15T09:00:00.000Z"
  }
}
```

### Error Responses
- `404` - Employee not found

---

## 6. Delete Employee
**DELETE** `/employees/:id`

### Description
Permanently deletes an employee and their associated user account.

### Required Roles
- `ADMIN`

### Required Permissions
- `DELETE_EMPLOYEES`

### URL Parameters
- `id` (string) - Employee ID

### Response
```json
{
  "message": "Employee deleted successfully",
  "deletedEmployeeId": "employee_id",
  "deletedUserId": "user_id"
}
```

### Error Responses
- `404` - Employee not found

---

## 7. Assign Permissions to Employee
**POST** `/employees/:id/permissions`

### Description
Assigns multiple permissions to an employee. This replaces all existing permissions with the new set.

### Required Roles
- `ADMIN`

### Required Permissions
- `MANAGE_PERMISSIONS`

### URL Parameters
- `id` (string) - Employee ID

### Request Body
```json
{
  "permissions": [
    "READ_CLIENTS",
    "WRITE_CLIENTS",
    "READ_CAMPAIGNS",
    "WRITE_CAMPAIGNS"
  ]
}
```

### Request Body Fields
- `permissions` (array, required) - Array of permission names to assign

### Response
```json
{
  "message": "Permissions assigned successfully",
  "employeeId": "employee_id",
  "assignedPermissions": [
    {
      "id": "new_permission_id_1",
      "employeeId": "employee_id",
      "permission": "READ_CLIENTS",
      "grantedAt": "2024-01-16T15:00:00.000Z",
      "grantedBy": "admin_user_id"
    },
    {
      "id": "new_permission_id_2",
      "employeeId": "employee_id",
      "permission": "WRITE_CLIENTS",
      "grantedAt": "2024-01-16T15:00:00.000Z",
      "grantedBy": "admin_user_id"
    },
    {
      "id": "new_permission_id_3",
      "employeeId": "employee_id",
      "permission": "READ_CAMPAIGNS",
      "grantedAt": "2024-01-16T15:00:00.000Z",
      "grantedBy": "admin_user_id"
    },
    {
      "id": "new_permission_id_4",
      "employeeId": "employee_id",
      "permission": "WRITE_CAMPAIGNS",
      "grantedAt": "2024-01-16T15:00:00.000Z",
      "grantedBy": "admin_user_id"
    }
  ],
  "assignedBy": "admin_user_id",
  "assignedAt": "2024-01-16T15:00:00.000Z"
}
```

### Error Responses
- `404` - Employee not found
- `400` - Invalid permission names

### Notes
- This operation replaces ALL existing permissions with the new set
- Previous permissions are removed before assigning new ones
- All permissions are assigned with the current timestamp and admin user ID

---

## 8. Remove Single Permission from Employee
**DELETE** `/employees/:id/permissions`

### Description
Removes a specific permission from an employee.

### Required Roles
- `ADMIN`

### Required Permissions
- `MANAGE_PERMISSIONS`

### URL Parameters
- `id` (string) - Employee ID

### Query Parameters
- `permission` (string, required) - Permission name to remove

### Example Request
```
DELETE /employees/employee_id/permissions?permission=WRITE_CLIENTS
```

### Response
```json
{
  "message": "Permission removed successfully",
  "employeeId": "employee_id",
  "removedPermission": "WRITE_CLIENTS",
  "removedAt": "2024-01-16T16:00:00.000Z"
}
```

### Error Responses
- `404` - Employee not found
- `404` - Permission not found for this employee
- `400` - Invalid permission name

---

## 9. Admin Reset Employee Password
**PATCH** `/employees/:id/reset-password`

### Description
Allows administrators to reset an employee's password without requiring the current password. Similar to the admin reset for clients.

### Required Roles
- `ADMIN`

### Required Permissions
- `WRITE_EMPLOYEES`

### URL Parameters
- `id` (string) - Employee ID

### Request Body
```json
{
  "newPassword": "new_secure_password123"
}
```

### Request Body Fields
- `newPassword` (string, required) - The new password (minimum 6 characters)

### Response
```json
{
  "message": "Password reset successfully",
  "employeeId": "employee_id",
  "userId": "user_id",
  "resetBy": "admin_user_id",
  "resetAt": "2024-01-16T16:30:00.000Z"
}
```

### Error Responses
- `404` - Employee not found
- `400` - Invalid password (less than 6 characters)

### Notes
- No current password required (admin override)
- Secure password hashing with bcrypt
- Administrative action for password recovery

---

## 10. Employee Self Change Password
**POST** `/employees/change-password`

### Description
Allows employees to change their own password by providing the current password.

### Required Roles
- `EMPLOYEE`

### Request Body
```json
{
  "currentPassword": "current_password",
  "newPassword": "new_secure_password123",
  "confirmPassword": "new_secure_password123"
}
```

### Request Body Fields
- `currentPassword` (string, required) - Current password
- `newPassword` (string, required) - New password (minimum 6 characters)
- `confirmPassword` (string, required) - Confirmation of new password

### Response
```json
{
  "message": "Password changed successfully",
  "employeeId": "employee_id",
  "changedAt": "2024-01-16T16:45:00.000Z"
}
```

### Error Responses
- `400` - Employee profile not found
- `400` - New password and confirmation do not match
- `400` - Current password is incorrect
- `404` - Employee not found

### Notes
- Requires current password for security
- Password confirmation required
- Employee can only change their own password

---

## 11. Upload Employee Profile Photo
**POST** `/employees/:id/profile-photo`

### Description
Uploads and updates the profile photo for an employee. Both admins and employees can use this endpoint.

### Required Roles
- `ADMIN` (can upload for any employee)
- `EMPLOYEE` (can only upload their own photo)

### Required Permissions
- No specific permissions required (role-based access)

### URL Parameters
- `id` (string) - Employee ID

### Request
**Content-Type:** `multipart/form-data`

### Form Data
- `photo` (file, required) - Image file for profile photo
  - Supported formats: JPG, JPEG, PNG, GIF, WebP
  - Maximum file size: 5MB

### Example Request
```javascript
const formData = new FormData();
formData.append('photo', fileInput.files[0]);

fetch('/employees/employee_id/profile-photo', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer <your-jwt-token>'
  },
  body: formData
});
```

### Response
```json
{
  "message": "Profile photo updated successfully",
  "profilePhoto": "/uploads/profile-photos/uuid-filename.jpg",
  "fileName": "uuid-filename.jpg",
  "originalName": "profile-photo.jpg",
  "uploadedAt": "2024-01-16T17:00:00.000Z"
}
```

### Error Responses
- `400` - No image uploaded
- `400` - Invalid file type (only images allowed)
- `400` - File too large (max 5MB)
- `400` - Forbidden (employees can only update their own photo)
- `404` - Employee not found

### Notes
- Images are stored in `/uploads/profile-photos/` directory
- Files are renamed with UUID to prevent conflicts
- Employees can only update their own profile photo
- Admins can update any employee's profile photo

---

## Permission Types Reference

### Client Management
- `READ_CLIENTS` - View client information
- `WRITE_CLIENTS` - Create and edit clients
- `DELETE_CLIENTS` - Delete client accounts

### Employee Management
- `READ_EMPLOYEES` - View employee information
- `WRITE_EMPLOYEES` - Create and edit employees
- `DELETE_EMPLOYEES` - Delete employee accounts

### Campaign Management
- `READ_CAMPAIGNS` - View campaign information
- `WRITE_CAMPAIGNS` - Create and edit campaigns
- `DELETE_CAMPAIGNS` - Delete campaigns

### System Administration
- `MANAGE_PERMISSIONS` - Assign and remove permissions from employees

---

## Error Codes

### Common HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized (invalid or missing token)
- `403` - Forbidden (insufficient permissions or role)
- `404` - Not Found
- `409` - Conflict (duplicate data)
- `500` - Internal Server Error

### Common Error Response Format
```json
{
  "statusCode": 400,
  "message": "Error description",
  "error": "Bad Request"
}
```

---

## Security Features

### Role-Based Access Control
- **ADMIN**: Full access to all employee management functions, can create other ADMINs and EMPLOYEEs
- **EMPLOYEE**: Limited read access to employee information, cannot create other users

### Permission-Based Access Control
- Granular permissions for specific operations
- Permission inheritance and validation
- Audit trail for permission changes

### Data Protection
- Passwords are securely hashed using bcrypt
- Sensitive employee data (salary) only visible to admins
- User account deletion cascades properly

### Audit Trail
- Permission assignments track who granted them and when
- Employee creation/modification is logged
- User actions are traceable through the system

---

## Best Practices

### Permission Management
1. **Principle of Least Privilege**: Only assign necessary permissions
2. **Regular Review**: Periodically review and update employee permissions
3. **Role Templates**: Consider creating standard permission sets for common roles

### Employee Lifecycle
1. **Onboarding**: Create employee with minimal permissions, add as needed
2. **Admin Creation**: Use `role: "ADMIN"` field to create system administrators
3. **Role Changes**: Update permissions when employees change roles (admins have full access by default)
4. **Offboarding**: Deactivate account before deletion for audit purposes

### Security
1. **Strong Passwords**: Enforce strong password policies for new employees
2. **Regular Updates**: Keep employee information current
3. **Access Review**: Regularly audit employee access and permissions
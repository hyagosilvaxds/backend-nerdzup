# Client Management API Documentation

This document provides comprehensive documentation for all client-related endpoints, including payloads and responses.

## Authentication
All endpoints require JWT authentication. Include the token in the `Authorization` header:
```
Authorization: Bearer <your-jwt-token>
```

## Base URL
```
http://localhost:4000/clients
```

---

## 1. Get All Clients
**GET** `/clients`

### Description
Returns all clients with their wallet information, current subscription plan, and total spending. Supports pagination, search, and sorting.

### Required Roles
- `ADMIN`
- `EMPLOYEE`

### Required Permissions
- `READ_CLIENTS`

### Query Parameters
- `page` (number, optional) - Page number (default: 1)
- `limit` (number, optional) - Items per page (default: 20, max: 100)
- `search` (string, optional) - Search by name, email, company name, or trade name
- `sortBy` (string, optional) - Sort field: `createdAt`, `fullName`, `companyName`, `totalSpent` (default: `createdAt`)
- `sortOrder` (string, optional) - Sort order: `asc` or `desc` (default: `desc`)

### Example Request
```
GET /clients?page=1&limit=10&search=acme&sortBy=totalSpent&sortOrder=desc
```

### Response
```json
{
  "clients": [
    {
      "id": "client_id",
      "userId": "user_id",
      "fullName": "John Doe",
      "personType": "BUSINESS",
      "taxDocument": "12345678000100",
      "position": "CEO",
      "companyName": "Acme Corp",
      "tradeName": "Acme",
      "sector": "Technology",
      "companySize": "MEDIUM",
      "website": "https://acme.com",
      "phone": "+5511999999999",
      "street": "123 Main St",
      "city": "São Paulo",
      "state": "SP",
      "zipCode": "01234567",
      "country": "Brasil",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "user": {
        "id": "user_id",
        "email": "john@acme.com",
        "role": "CLIENT",
        "isActive": true,
        "profilePhoto": "/uploads/profile-photos/photo.jpg",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      },
      "wallet": {
        "id": "wallet_id",
        "availableCredits": 1000,
        "totalEarned": 2000,
        "totalSpent": 1000
      },
      "currentPlan": {
        "id": "plan_id",
        "name": "premium",
        "monthlyPrice": "99.90",
        "monthlyCredits": 1000,
        "status": "ACTIVE",
        "startDate": "2024-01-01T00:00:00.000Z",
        "nextBillingDate": "2024-02-01T00:00:00.000Z"
      },
      "totalSpent": 1500.50
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 150,
    "pages": 15
  }
}
```

---

## 2. Get Single Client
**GET** `/clients/:id`

### Description
Returns detailed information about a specific client.

### Required Roles
- `ADMIN`
- `EMPLOYEE`
- `CLIENT` (only their own data)

### Required Permissions
- `READ_CLIENTS`

### URL Parameters
- `id` (string) - Client ID

### Response
```json
{
  "id": "client_id",
  "userId": "user_id",
  "fullName": "John Doe",
  "personType": "BUSINESS",
  "taxDocument": "12345678000100",
  "position": "CEO",
  "companyName": "Acme Corp",
  "tradeName": "Acme",
  "sector": "Technology",
  "companySize": "MEDIUM",
  "website": "https://acme.com",
  "phone": "+5511999999999",
  "street": "123 Main St",
  "city": "São Paulo",
  "state": "SP",
  "zipCode": "01234567",
  "country": "Brasil",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z",
  "user": {
    "id": "user_id",
    "email": "john@acme.com",
    "role": "CLIENT",
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "campaigns": [
    {
      "id": "campaign_id",
      "name": "Summer Campaign",
      "description": "Summer marketing campaign",
      "status": "ACTIVE",
      "employee": {
        "id": "employee_id",
        "name": "Jane Smith",
        "position": "Marketing Manager"
      }
    }
  ]
}
```

### Error Responses
- `404` - Client not found
- `403` - Forbidden (clients can only access their own data)

---

## 3. Create Client
**POST** `/clients`

### Description
Creates a new client account.

### Required Roles
- `ADMIN`
- `EMPLOYEE`

### Required Permissions
- `WRITE_CLIENTS`

### Request Body
```json
{
  "email": "john@acme.com",
  "password": "secure_password",
  "fullName": "John Doe",
  "personType": "BUSINESS",
  "taxDocument": "12345678000100",
  "position": "CEO",
  "companyName": "Acme Corp",
  "tradeName": "Acme",
  "sector": "Technology",
  "companySize": "MEDIUM",
  "website": "https://acme.com",
  "phone": "+5511999999999",
  "street": "123 Main St",
  "city": "São Paulo",
  "state": "SP",
  "zipCode": "01234567",
  "country": "Brasil"
}
```

### Response
```json
{
  "id": "user_id",
  "email": "john@acme.com",
  "role": "CLIENT",
  "isActive": true,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z",
  "client": {
    "id": "client_id",
    "userId": "user_id",
    "fullName": "John Doe",
    "personType": "BUSINESS",
    "taxDocument": "12345678000100",
    "position": "CEO",
    "companyName": "Acme Corp",
    "tradeName": "Acme",
    "sector": "Technology",
    "companySize": "MEDIUM",
    "website": "https://acme.com",
    "phone": "+5511999999999",
    "street": "123 Main St",
    "city": "São Paulo",
    "state": "SP",
    "zipCode": "01234567",
    "country": "Brasil",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Error Responses
- `409` - User with this email already exists

---

## 4. Update Client
**PATCH** `/clients/:id`

### Description
Updates client information.

### Required Roles
- `ADMIN`
- `EMPLOYEE`
- `CLIENT` (only their own data)

### Required Permissions
- `WRITE_CLIENTS`

### URL Parameters
- `id` (string) - Client ID

### Request Body
```json
{
  "fullName": "John Doe Updated",
  "phone": "+5511888888888",
  "website": "https://new-acme.com"
}
```

### Response
```json
{
  "id": "client_id",
  "userId": "user_id",
  "fullName": "John Doe Updated",
  "personType": "BUSINESS",
  "taxDocument": "12345678000100",
  "position": "CEO",
  "companyName": "Acme Corp",
  "tradeName": "Acme",
  "sector": "Technology",
  "companySize": "MEDIUM",
  "website": "https://new-acme.com",
  "phone": "+5511888888888",
  "street": "123 Main St",
  "city": "São Paulo",
  "state": "SP",
  "zipCode": "01234567",
  "country": "Brasil",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-02T00:00:00.000Z",
  "user": {
    "id": "user_id",
    "email": "john@acme.com",
    "role": "CLIENT",
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Error Responses
- `404` - Client not found
- `403` - Forbidden

---

## 5. Delete Client
**DELETE** `/clients/:id`

### Description
Permanently deletes a client and their associated user account.

### Required Roles
- `ADMIN`

### Required Permissions
- `DELETE_CLIENTS`

### URL Parameters
- `id` (string) - Client ID

### Response
```json
{
  "message": "Client deleted successfully"
}
```

### Error Responses
- `404` - Client not found

---

## 6. Toggle Client Status
**PATCH** `/clients/:id/toggle-status`

### Description
Toggles the active status of a client's user account.

### Required Roles
- `ADMIN`
- `EMPLOYEE`

### Required Permissions
- `WRITE_CLIENTS`

### URL Parameters
- `id` (string) - Client ID

### Response
```json
{
  "id": "user_id",
  "email": "john@acme.com",
  "role": "CLIENT",
  "isActive": false,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-02T00:00:00.000Z",
  "client": {
    "id": "client_id",
    "userId": "user_id",
    "fullName": "John Doe",
    // ... other client fields
  }
}
```

### Error Responses
- `404` - Client not found

---

## 7. Change Password
**POST** `/clients/change-password`

### Description
Allows clients to change their password.

### Required Roles
- `CLIENT`

### Request Body
```json
{
  "currentPassword": "old_password",
  "newPassword": "new_secure_password",
  "confirmPassword": "new_secure_password"
}
```

### Response
```json
{
  "message": "Password changed successfully"
}
```

### Error Responses
- `400` - New password and confirmation do not match
- `400` - Current password is incorrect
- `404` - User not found

---

## 8. Add Client Note
**POST** `/clients/:id/notes`

### Description
Adds a note to a client's record. Only accessible by admins and employees.

### Required Roles
- `ADMIN`
- `EMPLOYEE`

### Required Permissions
- `WRITE_CLIENTS`

### URL Parameters
- `id` (string) - Client ID

### Request Body
```json
{
  "note": "Client called requesting information about premium plan."
}
```

### Response
```json
{
  "id": "note_id",
  "clientId": "client_id",
  "note": "Client called requesting information about premium plan.",
  "authorId": "employee_user_id",
  "createdAt": "2024-01-02T10:30:00.000Z",
  "updatedAt": "2024-01-02T10:30:00.000Z",
  "author": {
    "id": "employee_user_id",
    "email": "employee@company.com",
    "employee": {
      "name": "Jane Smith"
    }
  }
}
```

### Error Responses
- `404` - Client not found

---

## 9. Get Client Notes
**GET** `/clients/:id/notes`

### Description
Retrieves all notes for a specific client. Only accessible by admins and employees.

### Required Roles
- `ADMIN`
- `EMPLOYEE`

### Required Permissions
- `READ_CLIENTS`

### URL Parameters
- `id` (string) - Client ID

### Response
```json
[
  {
    "id": "note_id",
    "clientId": "client_id",
    "note": "Client called requesting information about premium plan.",
    "authorId": "employee_user_id",
    "createdAt": "2024-01-02T10:30:00.000Z",
    "updatedAt": "2024-01-02T10:30:00.000Z",
    "author": {
      "id": "employee_user_id",
      "email": "employee@company.com",
      "employee": {
        "name": "Jane Smith"
      }
    }
  },
  {
    "id": "note_id_2",
    "clientId": "client_id",
    "note": "Account suspended due to payment issues.",
    "authorId": "admin_user_id",
    "createdAt": "2024-01-01T15:45:00.000Z",
    "updatedAt": "2024-01-01T15:45:00.000Z",
    "author": {
      "id": "admin_user_id",
      "email": "admin@company.com",
      "employee": {
        "name": "Admin User"
      }
    }
  }
]
```

### Error Responses
- `404` - Client not found

---

## 10. Get Client Files
**GET** `/clients/:id/files`

### Description
Retrieves all files associated with a client, including uploaded documents and received deliverables.

### Required Roles
- `ADMIN`
- `EMPLOYEE`
- `CLIENT` (only their own files)

### Required Permissions
- `READ_CLIENTS`

### URL Parameters
- `id` (string) - Client ID

### Response
```json
{
  "clientUploads": [
    {
      "id": "service_request_id-file_url",
      "fileName": "project-brief.pdf",
      "fileUrl": "http://localhost:4000/uploads/documents/project-brief.pdf",
      "fileType": "CLIENT_UPLOAD",
      "uploadedAt": "2024-01-01T12:00:00.000Z",
      "source": {
        "type": "service_request",
        "id": "service_request_id",
        "name": "Website Redesign Project",
        "service": "Web Development"
      }
    }
  ],
  "deliverables": [
    {
      "id": "task_file_id",
      "fileName": "logo-final.png",
      "fileUrl": "http://localhost:4000/uploads/deliverables/logo-final.png",
      "fileType": "DELIVERABLE",
      "uploadedAt": "2024-01-05T14:30:00.000Z",
      "description": "Final logo design in PNG format",
      "uploadedBy": "designer_user_id",
      "source": {
        "type": "task_deliverable",
        "id": "task_id",
        "name": "Logo Design Task"
      }
    }
  ],
  "libraryFiles": [
    {
      "id": "library_file_id",
      "fileName": "company-logo.png",
      "fileUrl": "/uploads/client-library/uuid-filename.png",
      "fileType": "LIBRARY",
      "fileSize": 245760,
      "mimeType": "image/png",
      "uploadedAt": "2024-01-01T12:00:00.000Z",
      "description": "Company logo in high resolution",
      "uploadedBy": "Admin User",
      "libraryFileType": "BRAND_ASSET",
      "source": {
        "type": "client_library",
        "id": "library_file_id",
        "name": "Client Library"
      }
    }
  ],
  "totalFiles": 3
}
```

### Error Responses
- `400` - Forbidden (clients can only access their own files)
- `404` - Client not found

---

## 11. Get Service Requests History
**GET** `/clients/:id/service-requests-history`

### Description
Retrieves the service requests history for a client with pagination and optional status filtering.

### Required Roles
- `ADMIN`
- `EMPLOYEE`
- `CLIENT` (only their own history)

### Required Permissions
- `READ_CLIENTS`

### URL Parameters
- `id` (string) - Client ID

### Query Parameters
- `page` (number, optional) - Page number (default: 1)
- `limit` (number, optional) - Items per page (default: 10)
- `status` (string, optional) - Filter by status (PENDING, IN_PROGRESS, COMPLETED, CANCELLED)

### Example Request
```
GET /clients/client_id/service-requests-history?page=1&limit=10&status=COMPLETED
```

### Response
```json
{
  "requests": [
    {
      "id": "service_request_id",
      "projectName": "Website Redesign",
      "targetAudience": "Young adults 18-35",
      "brandGuidelines": "Modern, minimalist design",
      "budget": "5000.00",
      "timeline": "4 weeks",
      "additionalInfo": "Need mobile-first approach",
      "documentUrls": [
        "http://localhost:4000/uploads/documents/brief.pdf"
      ],
      "status": "COMPLETED",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-15T00:00:00.000Z",
      "clientId": "client_id",
      "serviceId": "service_id",
      "service": {
        "id": "service_id",
        "name": "web-development",
        "displayName": "Web Development",
        "category": {
          "name": "development",
          "displayName": "Development"
        }
      },
      "task": {
        "id": "task_id",
        "title": "Website Redesign for Acme Corp",
        "status": "COMPLETED",
        "progress": 100
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3
  }
}
```

### Error Responses
- `400` - Forbidden (clients can only access their own history)
- `404` - Client not found

---

## 12. Suspend Client Account
**PATCH** `/clients/:id/suspend`

### Description
Suspends a client's account, setting their user status to inactive and adding a suspension note.

### Required Roles
- `ADMIN`
- `EMPLOYEE`

### Required Permissions
- `WRITE_CLIENTS`

### URL Parameters
- `id` (string) - Client ID

### Response
```json
{
  "id": "user_id",
  "email": "john@acme.com",
  "role": "CLIENT",
  "isActive": false,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-02T00:00:00.000Z",
  "client": {
    "id": "client_id",
    "userId": "user_id",
    "fullName": "John Doe",
    // ... other client fields
  },
  "message": "Account suspended successfully"
}
```

### Error Responses
- `404` - Client not found

---

## 13. Unsuspend Client Account
**PATCH** `/clients/:id/unsuspend`

### Description
Reactivates a suspended client account, setting their user status to active and adding a reactivation note.

### Required Roles
- `ADMIN`
- `EMPLOYEE`

### Required Permissions
- `WRITE_CLIENTS`

### URL Parameters
- `id` (string) - Client ID

### Response
```json
{
  "id": "user_id",
  "email": "john@acme.com",
  "role": "CLIENT",
  "isActive": true,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-02T00:00:00.000Z",
  "client": {
    "id": "client_id",
    "userId": "user_id",
    "fullName": "John Doe",
    // ... other client fields
  },
  "message": "Account reactivated successfully"
}
```

### Error Responses
- `404` - Client not found

---

## 14. Get Client Wallet Details
**GET** `/clients/:id/wallet`

### Description
Retrieves detailed wallet information for a client, including balance, recent transactions, current plan, and total spending.

### Required Roles
- `ADMIN`
- `EMPLOYEE`
- `CLIENT` (only their own wallet)

### Required Permissions
- `READ_CLIENTS`

### URL Parameters
- `id` (string) - Client ID

### Response
```json
{
  "wallet": {
    "id": "wallet_id",
    "clientId": "client_id",
    "availableCredits": 1500,
    "totalEarned": 3000,
    "totalSpent": 1500,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-02T00:00:00.000Z"
  },
  "recentTransactions": [
    {
      "id": "transaction_id",
      "clientId": "client_id",
      "type": "SERVICE_CONSUMPTION",
      "amount": "150.00",
      "credits": 150,
      "description": "Logo design service",
      "paymentMethod": "CREDIT_CARD",
      "status": "COMPLETED",
      "createdAt": "2024-01-02T10:00:00.000Z",
      "updatedAt": "2024-01-02T10:00:00.000Z"
    },
    {
      "id": "transaction_id_2",
      "clientId": "client_id",
      "type": "CREDIT_PURCHASE",
      "amount": "500.00",
      "credits": 500,
      "description": "Credit package purchase",
      "paymentMethod": "PIX",
      "status": "COMPLETED",
      "createdAt": "2024-01-01T15:30:00.000Z",
      "updatedAt": "2024-01-01T15:30:00.000Z"
    }
  ],
  "currentPlan": {
    "id": "subscription_id",
    "clientId": "client_id",
    "planId": "plan_id",
    "status": "ACTIVE",
    "startDate": "2024-01-01T00:00:00.000Z",
    "endDate": null,
    "nextBillingDate": "2024-02-01T00:00:00.000Z",
    "paymentMethod": "CREDIT_CARD",
    "isAutoRenew": true,
    "plan": {
      "id": "plan_id",
      "name": "premium",
      "displayName": "Premium Plan",
      "description": "Advanced features for growing businesses",
      "monthlyCredits": 1000,
      "monthlyPrice": "99.90",
      "isActive": true,
      "features": [
        "Priority support",
        "Advanced analytics",
        "Custom integrations"
      ]
    }
  },
  "totalSpent": 2500.75
}
```

### Error Responses
- `400` - Forbidden (clients can only access their own wallet)
- `404` - Client not found

---

## 15. Adjust Client Credits (Admin Only)
**PATCH** `/clients/:id/adjust-credits`

### Description
Allows administrators to manually adjust a client's credit balance. The adjustment is recorded in the transaction history and a note is added to the client's record.

### Required Roles
- `ADMIN`

### Required Permissions
- `WRITE_CLIENTS`

### URL Parameters
- `id` (string) - Client ID

### Request Body
```json
{
  "credits": 500,
  "reason": "Promotional bonus for loyal customer"
}
```

### Request Body Fields
- `credits` (number, required) - Number of credits to add (minimum: 1)
- `reason` (string, optional) - Reason for the credit adjustment

### Response
```json
{
  "message": "Créditos ajustados com sucesso",
  "wallet": {
    "id": "wallet_id",
    "clientId": "client_id",
    "availableCredits": 1500,
    "totalEarned": 2500,
    "totalSpent": 1000,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-02T12:00:00.000Z"
  },
  "transaction": {
    "id": "transaction_id",
    "credits": 500,
    "description": "Promotional bonus for loyal customer",
    "createdAt": "2024-01-02T12:00:00.000Z"
  },
  "adjustment": {
    "credits": 500,
    "reason": "Promotional bonus for loyal customer",
    "adjustedBy": "admin_user_id",
    "adjustedAt": "2024-01-02T12:00:00.000Z"
  }
}
```

### Error Responses
- `404` - Client not found
- `400` - Invalid credits amount (must be at least 1)

### Notes
- The adjustment creates a transaction record with type `CREDIT_ADJUSTMENT`
- A note is automatically added to the client's record documenting the adjustment
- If the client doesn't have a wallet, one will be created automatically
- The credits are added to both `availableCredits` and `totalEarned` fields

---

## 16. Upload Profile Photo
**POST** `/clients/:id/profile-photo`

### Description
Uploads and updates the profile photo for a client. Supports both admin/employee operations and client self-update.

### Required Roles
- `ADMIN`
- `EMPLOYEE`
- `CLIENT` (only their own profile photo)

### Required Permissions
- No specific permissions required (role-based access)

### URL Parameters
- `id` (string) - Client ID

### Request
**Content-Type:** `multipart/form-data`

### Form Data
- `photo` (file) - Image file for profile photo
  - Supported formats: JPG, JPEG, PNG, GIF, WebP
  - Maximum file size: 5MB

### Example Request
```javascript
const formData = new FormData();
formData.append('photo', file);

fetch('/clients/client_id/profile-photo', {
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
  "message": "Foto de perfil atualizada com sucesso",
  "profilePhoto": "/uploads/profile-photos/uuid-filename.jpg",
  "fileName": "uuid-filename.jpg",
  "originalName": "profile-photo.jpg",
  "uploadedAt": "2024-01-01T12:00:00.000Z"
}
```

### Error Responses
- `400` - Bad Request (no file uploaded, invalid file type, file too large)
- `403` - Forbidden (clients can only update their own profile photo)
- `404` - Client not found

---

## 17. Upload File to Client Library
**POST** `/clients/:id/library/upload`

### Description
Uploads a file to the client's library. Both clients and admins/employees can upload files.

### Required Roles
- `ADMIN` (can upload to any client's library)
- `EMPLOYEE` (can upload to any client's library)
- `CLIENT` (can only upload to their own library)

### Required Permissions
- No specific permissions required (role-based access)

### URL Parameters
- `id` (string) - Client ID

### Request
**Content-Type:** `multipart/form-data`

### Form Data
- `file` (file, required) - File to upload
  - Maximum file size: 1GB
  - All file types accepted
- `fileType` (string, optional) - Type of file: `REFERENCE`, `BRAND_ASSET`, `DOCUMENT`, `OTHER` (default: `OTHER`)
- `description` (string, optional) - Description of the file

### Example Request
```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);
formData.append('fileType', 'BRAND_ASSET');
formData.append('description', 'Company logo in high resolution');

fetch('/clients/client_id/library/upload', {
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
  "message": "Arquivo adicionado à biblioteca com sucesso",
  "file": {
    "id": "library_file_id",
    "fileName": "uuid-filename.png",
    "originalName": "company-logo.png",
    "fileUrl": "/uploads/client-library/uuid-filename.png",
    "fileType": "BRAND_ASSET",
    "fileSize": 245760,
    "mimeType": "image/png",
    "description": "Company logo in high resolution",
    "uploadedAt": "2024-01-01T12:00:00.000Z",
    "uploadedBy": {
      "id": "user_id",
      "email": "admin@company.com",
      "name": "Admin User"
    }
  }
}
```

### Error Responses
- `400` - No file uploaded
- `400` - File too large (max 1GB)
- `400` - Forbidden (clients can only upload to their own library)
- `404` - Client not found

### File Types
- `REFERENCE` - Reference materials and inspiration files
- `BRAND_ASSET` - Brand assets like logos, style guides, fonts
- `DOCUMENT` - General documents and files
- `OTHER` - Other types of files (default)

### Notes
- Files are stored in `/uploads/client-library/` directory
- Original filename is preserved in the database
- Files can be organized by type for better categorization
- Both clients and staff can upload files to the library
- Library files are included in the client files endpoint response

---

## 18. Delete File from Client Library
**DELETE** `/clients/:id/library/:fileId`

### Description
Deletes a file from the client's library. Only admins can delete library files.

### Required Roles
- `ADMIN`

### Required Permissions
- `DELETE_CLIENTS`

### URL Parameters
- `id` (string) - Client ID
- `fileId` (string) - Library file ID to delete

### Response
```json
{
  "message": "Arquivo removido da biblioteca com sucesso",
  "deletedFile": {
    "id": "library_file_id",
    "originalName": "company-logo.png",
    "fileType": "BRAND_ASSET",
    "fileSize": 245760,
    "deletedAt": "2024-01-01T15:30:00.000Z",
    "deletedBy": "admin_user_id"
  }
}
```

### Error Responses
- `404` - Client not found
- `404` - File not found in client's library
- `403` - Forbidden (only admins can delete library files)

### Notes
- The physical file is deleted from the server
- A note is automatically added to the client's record documenting the deletion
- The database record is permanently removed
- If the physical file cannot be deleted, the database record is still removed
- This action cannot be undone

### Security
- Only administrators can delete library files
- The action is logged in the client's notes for audit purposes
- File ownership is verified before deletion

---

## 19. Admin Change User Password
**PATCH** `/clients/:id/admin-change-password`

### Description
Allows administrators to change a client's password without requiring the current password. This is useful for password resets and administrative account management.

### Required Roles
- `ADMIN`

### Required Permissions
- `WRITE_CLIENTS`

### URL Parameters
- `id` (string) - Client ID

### Request Body
```json
{
  "newPassword": "new_secure_password123"
}
```

### Request Body Fields
- `newPassword` (string, required) - The new password for the user (minimum 6 characters)

### Response
```json
{
  "message": "Senha alterada com sucesso pelo administrador",
  "clientId": "client_id",
  "userId": "user_id", 
  "changedBy": "admin_user_id",
  "changedAt": "2024-01-01T15:30:00.000Z"
}
```

### Error Responses
- `404` - Client not found
- `400` - Invalid password (less than 6 characters)
- `403` - Forbidden (only admins can use this endpoint)

### Notes
- **No current password required** - Unlike the regular password change endpoint, admins don't need to provide the current password
- **Automatic logging** - A note is automatically added to the client's record documenting the password change
- **Secure hashing** - The new password is securely hashed using bcrypt with salt rounds of 12
- **Administrative override** - This endpoint bypasses normal password change restrictions for administrative purposes

### Security Considerations
- This endpoint should only be used by trusted administrators
- The password change is logged for audit purposes
- The client will need to use the new password for their next login
- Consider notifying the client through other means when their password is changed by an admin

### Differences from Regular Password Change
- **Regular endpoint** (`POST /clients/change-password`): Requires current password, only accessible by the client themselves
- **Admin endpoint** (`PATCH /clients/:id/admin-change-password`): No current password required, only accessible by admins, can change any client's password

---

## Error Codes

### Common HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized (invalid or missing token)
- `403` - Forbidden (insufficient permissions or unauthorized access)
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

## Data Types Reference

### PersonType
- `INDIVIDUAL` - Pessoa Física
- `BUSINESS` - Pessoa Jurídica

### CompanySize
- `MICRO` - 1-10 funcionários
- `SMALL` - 11-50 funcionários  
- `MEDIUM` - 51-200 funcionários
- `LARGE` - 201-1000 funcionários
- `ENTERPRISE` - 1000+ funcionários

### Role
- `CLIENT` - Cliente
- `EMPLOYEE` - Funcionário
- `ADMIN` - Administrador

### Permission
- `READ_CLIENTS` - Ler dados de clientes
- `WRITE_CLIENTS` - Escrever dados de clientes
- `DELETE_CLIENTS` - Deletar clientes

### TransactionType
- `SUBSCRIPTION_PAYMENT` - Pagamento de assinatura
- `CREDIT_PURCHASE` - Compra de créditos avulsa
- `CREDIT_ADJUSTMENT` - Ajuste manual de créditos
- `SERVICE_CONSUMPTION` - Consumo de créditos por serviço

### PaymentMethod
- `CREDIT_CARD` - Cartão de crédito
- `PIX` - PIX
- `BANK_SLIP` - Boleto bancário

### SubscriptionStatus
- `ACTIVE` - Ativa
- `INACTIVE` - Inativa
- `CANCELLED` - Cancelada
- `EXPIRED` - Expirada

### TaskFileType
- `DELIVERABLE` - Entregável
- `REFERENCE` - Referência
- `FEEDBACK` - Feedback
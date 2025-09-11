# Service Requests API Documentation

This document provides comprehensive documentation for all service request-related endpoints, including payloads and responses.

## Authentication
All endpoints require JWT authentication. Include the token in the `Authorization` header:
```
Authorization: Bearer <your-jwt-token>
```

## Base URL
```
http://localhost:4000/service-requests
```

---

## Client Endpoints

### 1. Check if Client Can Request Service
**GET** `/service-requests/can-request/:serviceId`

#### Description
Checks if a client has enough credits to request a specific service.

#### Required Roles
- `CLIENT`

#### URL Parameters
- `serviceId` (string) - Service ID to check

#### Response
```json
{
  "canRequest": true,
  "service": {
    "id": "service_id",
    "displayName": "Web Development",
    "requiredCredits": 500
  },
  "wallet": {
    "availableCredits": 1000
  },
  "message": "You have enough credits to request this service"
}
```

#### Error Responses
- `404` - Service not found or inactive
- `400` - Client profile not found

---

### 2. Create Service Request
**POST** `/service-requests`

#### Description
Creates a new service request with project details and optional document uploads.

#### Required Roles
- `CLIENT`

#### Content-Type
`multipart/form-data`

#### Form Fields
- `serviceId` (string, required) - ID of the requested service
- `projectName` (string, required) - Name of the project
- `description` (string, required) - Project description
- `desiredDeadline` (string, optional) - Desired completion date
- `targetAudience` (string, optional) - Target audience description
- `projectObjectives` (string, optional) - Project objectives
- `brandGuidelines` (string, optional) - Brand guidelines
- `preferredColors` (string, optional) - JSON array of preferred colors
- `technicalRequirements` (string, optional) - Technical requirements
- `references` (string, optional) - Reference materials or examples
- `observations` (string, optional) - Additional observations
- `priority` (string, optional) - Request priority
- `dueDate` (string, optional) - Required completion date
- `documents` (files, optional) - Up to 10 documents (max 1GB each)

#### Example Request
```javascript
const formData = new FormData();
formData.append('serviceId', 'service_123');
formData.append('projectName', 'Company Website Redesign');
formData.append('description', 'Complete redesign of our corporate website');
formData.append('targetAudience', 'B2B clients and partners');
formData.append('preferredColors', JSON.stringify(['#0066CC', '#FF6600']));
formData.append('documents', file1);
formData.append('documents', file2);
```

#### Response
```json
{
  "id": "service_request_id",
  "projectName": "Company Website Redesign",
  "description": "Complete redesign of our corporate website",
  "targetAudience": "B2B clients and partners",
  "projectObjectives": null,
  "brandGuidelines": null,
  "preferredColors": ["#0066CC", "#FF6600"],
  "technicalRequirements": null,
  "references": null,
  "observations": null,
  "priority": null,
  "dueDate": null,
  "documentUrls": [
    "http://localhost:4000/uploads/service-request-documents/doc1.pdf",
    "http://localhost:4000/uploads/service-request-documents/doc2.pdf"
  ],
  "status": "PENDING",
  "createdAt": "2024-01-01T12:00:00.000Z",
  "updatedAt": "2024-01-01T12:00:00.000Z",
  "clientId": "client_id",
  "serviceId": "service_123",
  "service": {
    "id": "service_123",
    "displayName": "Web Development",
    "credits": 500
  }
}
```

#### Error Responses
- `400` - Missing required fields or invalid data
- `400` - Client profile not found
- `400` - File too large (max 1GB per file)
- `400` - Upload failed

---

### 3. Get My Service Requests
**GET** `/service-requests/my-requests`

#### Description
Retrieves all service requests for the authenticated client with pagination and filtering.

#### Required Roles
- `CLIENT`

#### Query Parameters
- `page` (number, optional) - Page number (default: 1)
- `limit` (number, optional) - Items per page (default: 10)
- `status` (string, optional) - Filter by status: PENDING, APPROVED, REJECTED, CANCELLED
- `serviceId` (string, optional) - Filter by service ID

#### Response
```json
{
  "requests": [
    {
      "id": "service_request_id",
      "projectName": "Company Website Redesign",
      "description": "Complete redesign of our corporate website",
      "status": "PENDING",
      "createdAt": "2024-01-01T12:00:00.000Z",
      "service": {
        "id": "service_123",
        "displayName": "Web Development",
        "credits": 500
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

---

### 4. Get Service Request Details (Client)
**GET** `/service-requests/my-requests/:id`

#### Description
Retrieves detailed information about a specific service request belonging to the authenticated client.

#### Required Roles
- `CLIENT`

#### URL Parameters
- `id` (string) - Service request ID

#### Response
```json
{
  "id": "service_request_id",
  "projectName": "Company Website Redesign",
  "description": "Complete redesign of our corporate website",
  "desiredDeadline": "2024-02-15",
  "targetAudience": "B2B clients and partners",
  "projectObjectives": "Increase conversion rate by 25%",
  "brandGuidelines": "Modern, professional look with company colors",
  "preferredColors": ["#0066CC", "#FF6600"],
  "technicalRequirements": "Responsive design, SEO optimized",
  "references": "Check competitor websites for inspiration",
  "observations": "Current website is outdated",
  "priority": "HIGH",
  "dueDate": "2024-02-15T00:00:00.000Z",
  "documentUrls": [
    "http://localhost:4000/uploads/service-request-documents/brief.pdf"
  ],
  "status": "APPROVED",
  "approvalNotes": "Approved for development. Estimated completion: 3 weeks",
  "rejectionReason": null,
  "approvedAt": "2024-01-02T09:00:00.000Z",
  "approvedBy": "employee_user_id",
  "createdAt": "2024-01-01T12:00:00.000Z",
  "updatedAt": "2024-01-02T09:00:00.000Z",
  "clientId": "client_id",
  "serviceId": "service_123",
  "service": {
    "id": "service_123",
    "name": "web-development",
    "displayName": "Web Development",
    "description": "Professional web development services",
    "shortDescription": "Custom websites and web applications",
    "credits": 500,
    "estimatedDays": 21,
    "difficulty": "MEDIUM",
    "iconUrl": "/uploads/service-icons/web-dev.png",
    "features": ["Responsive Design", "SEO Optimization", "Content Management"],
    "benefits": ["Professional appearance", "Increased visibility", "Easy content updates"]
  },
  "client": {
    "id": "client_id",
    "fullName": "John Doe",
    "user": {
      "email": "john@example.com"
    }
  },
  "task": {
    "id": "task_id",
    "title": "Website Redesign for John Doe",
    "description": "Complete redesign of corporate website",
    "status": "IN_PROGRESS",
    "progress": 35,
    "dueDate": "2024-02-15T00:00:00.000Z",
    "completedAt": null,
    "assignees": [
      {
        "employee": {
          "id": "employee_id",
          "name": "Jane Smith",
          "user": {
            "email": "jane@company.com"
          }
        }
      }
    ]
  }
}
```

#### Error Responses
- `404` - Service request not found
- `400` - Client profile not found

---

### 5. Update Service Request (Client)
**PATCH** `/service-requests/my-requests/:id`

#### Description
Updates a service request. Only allowed for pending requests.

#### Required Roles
- `CLIENT`

#### URL Parameters
- `id` (string) - Service request ID

#### Request Body
```json
{
  "projectName": "Updated Company Website Redesign",
  "description": "Updated description",
  "targetAudience": "Updated target audience"
}
```

#### Response
Same as service request details response with updated fields.

#### Error Responses
- `404` - Service request not found or cannot be modified
- `400` - Client profile not found

---

### 6. Cancel Service Request (Client)
**DELETE** `/service-requests/my-requests/:id`

#### Description
Cancels a service request. Only allowed for pending requests.

#### Required Roles
- `CLIENT`

#### URL Parameters
- `id` (string) - Service request ID

#### Response
```json
{
  "message": "Service request cancelled successfully",
  "id": "service_request_id",
  "status": "CANCELLED"
}
```

#### Error Responses
- `404` - Service request not found
- `400` - Client profile not found

---

### 7. Get Client Statistics
**GET** `/service-requests/my-stats`

#### Description
Retrieves service request statistics for the authenticated client.

#### Required Roles
- `CLIENT`

#### Response
```json
{
  "total": 15,
  "pending": 2,
  "approved": 10,
  "rejected": 2,
  "cancelled": 1
}
```

---

## Admin/Employee Endpoints

### 8. Get All Service Requests
**GET** `/service-requests`

#### Description
Retrieves all service requests with pagination and filtering (admin/employee only).

#### Required Roles
- `ADMIN`
- `EMPLOYEE`

#### Query Parameters
- `page` (number, optional) - Page number (default: 1)
- `limit` (number, optional) - Items per page (default: 10)
- `status` (string, optional) - Filter by status
- `serviceId` (string, optional) - Filter by service ID
- `clientId` (string, optional) - Filter by client ID

#### Response
```json
{
  "requests": [
    {
      "id": "service_request_id",
      "projectName": "Company Website Redesign",
      "status": "PENDING",
      "createdAt": "2024-01-01T12:00:00.000Z",
      "client": {
        "fullName": "John Doe",
        "user": {
          "email": "john@example.com"
        }
      },
      "service": {
        "displayName": "Web Development",
        "credits": 500
      }
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

### 9. Get Service Request Details (Admin/Employee)
**GET** `/service-requests/:id`

#### Description
Retrieves detailed information about any service request (admin/employee only).

#### Required Roles
- `ADMIN`
- `EMPLOYEE`

#### URL Parameters
- `id` (string) - Service request ID

#### Response
Same detailed response format as the client endpoint, but accessible for any service request regardless of client ownership.

#### Error Responses
- `404` - Service request not found

---

### 10. Get Service Request Statistics
**GET** `/service-requests/stats`

#### Description
Retrieves overall service request statistics (admin/employee only).

#### Required Roles
- `ADMIN`
- `EMPLOYEE`

#### Response
```json
{
  "total": 500,
  "pending": 45,
  "approved": 380,
  "rejected": 50,
  "cancelled": 25
}
```

---

### 11. Approve Service Request
**POST** `/service-requests/:id/approve`

#### Description
Approves a service request and optionally creates a task.

#### Required Roles
- `ADMIN`
- `EMPLOYEE`

#### URL Parameters
- `id` (string) - Service request ID

#### Request Body
```json
{
  "approvalNotes": "Approved for development. Timeline looks good.",
  "createTask": true,
  "taskTitle": "Website Redesign for John Doe",
  "taskDescription": "Complete website redesign as per client specifications",
  "estimatedHours": 40,
  "dueDate": "2024-02-15T00:00:00.000Z",
  "assigneeIds": ["employee_id_1", "employee_id_2"]
}
```

#### Request Body Fields
- `approvalNotes` (string, optional) - Notes about the approval
- `createTask` (boolean, optional) - Whether to create a task (default: false)
- `taskTitle` (string, optional) - Task title (required if createTask is true)
- `taskDescription` (string, optional) - Task description
- `estimatedHours` (number, optional) - Estimated hours for completion
- `dueDate` (string, optional) - Task due date
- `assigneeIds` (array, optional) - Array of employee IDs to assign

#### Response
```json
{
  "message": "Service request approved successfully",
  "serviceRequest": {
    "id": "service_request_id",
    "status": "APPROVED",
    "approvalNotes": "Approved for development. Timeline looks good.",
    "approvedAt": "2024-01-02T09:00:00.000Z",
    "approvedBy": "employee_user_id"
  },
  "task": {
    "id": "task_id",
    "title": "Website Redesign for John Doe",
    "status": "TODO",
    "assignees": [
      {
        "employee": {
          "name": "Jane Smith"
        }
      }
    ]
  }
}
```

#### Error Responses
- `404` - Service request not found
- `400` - Service request cannot be approved (wrong status)

---

### 12. Reject Service Request
**POST** `/service-requests/:id/reject`

#### Description
Rejects a service request with a reason.

#### Required Roles
- `ADMIN`
- `EMPLOYEE`

#### URL Parameters
- `id` (string) - Service request ID

#### Request Body
```json
{
  "rejectionReason": "Insufficient project details provided. Please provide more specific requirements."
}
```

#### Request Body Fields
- `rejectionReason` (string, required) - Reason for rejection

#### Response
```json
{
  "message": "Service request rejected successfully",
  "serviceRequest": {
    "id": "service_request_id",
    "status": "REJECTED",
    "rejectionReason": "Insufficient project details provided. Please provide more specific requirements.",
    "rejectedAt": "2024-01-02T09:00:00.000Z",
    "rejectedBy": "employee_user_id"
  }
}
```

#### Error Responses
- `404` - Service request not found
- `400` - Service request cannot be rejected (wrong status)

---

## Error Codes

### Common HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized (invalid or missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `413` - Payload Too Large (file size limit exceeded)
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

### ServiceRequestStatus
- `PENDING` - Aguardando aprovação
- `APPROVED` - Aprovada
- `REJECTED` - Rejeitada
- `CANCELLED` - Cancelada

### TaskStatus
- `TODO` - A fazer
- `IN_PROGRESS` - Em andamento
- `COMPLETED` - Concluída
- `CANCELLED` - Cancelada

### Priority Levels
- `LOW` - Baixa
- `MEDIUM` - Média
- `HIGH` - Alta
- `URGENT` - Urgente

### File Upload Limits
- Maximum file size: 1GB per file
- Maximum files per request: 10 files
- Supported formats: All formats accepted
- Upload directory: `/uploads/service-request-documents/`
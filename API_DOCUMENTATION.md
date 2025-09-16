# API Documentation - Service Requests, Campaigns & Tasks

## Overview
This documentation covers the three main modules of the system: Service Requests, Campaigns, and Tasks. These modules work together to manage the complete lifecycle of client projects from initial request to completion.

## Authentication
All endpoints require JWT authentication via the `Authorization: Bearer <token>` header.

## Role-Based Access Control
- **CLIENT**: Can only access their own data
- **EMPLOYEE**: Can access assigned data and some administrative functions
- **ADMIN**: Full access to all data and administrative functions

---

# SERVICE REQUESTS MODULE

## Base URL: `/service-requests`

### Client Endpoints

#### 1. Check If Client Can Request Service
**GET** `/service-requests/can-request/:serviceId`
- **Role**: CLIENT
- **Description**: Check if client can request a specific service
- **Parameters**:
  - `serviceId` (string, required): Service UUID
- **Response**:
```json
{
  "canRequest": true,
  "message": "Service available for request"
}
```

#### 2. Create Service Request
**POST** `/service-requests`
- **Role**: CLIENT
- **Content-Type**: `multipart/form-data`
- **Description**: Create a new service request with optional file uploads
- **Body**:
```json
{
  "serviceId": "uuid",
  "projectName": "string",
  "description": "string",
  "desiredDeadline": "2024-01-01T00:00:00.000Z",
  "targetAudience": "string",
  "projectObjectives": "string",
  "brandGuidelines": "string",
  "preferredColors": ["#FF0000", "#00FF00"],
  "technicalRequirements": "string",
  "references": "string",
  "observations": "string",
  "priority": "BAIXA|MEDIA|ALTA|CRITICA",
  "dueDate": "2024-01-01T00:00:00.000Z"
}
```
- **Files**: `documents[]` (max 10 files, 1GB each)
- **Response**:
```json
{
  "id": "uuid",
  "serviceId": "uuid",
  "clientId": "uuid",
  "projectName": "string",
  "description": "string",
  "status": "PENDENTE",
  "priority": "MEDIA",
  "documentUrls": ["string"],
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

#### 3. Get My Service Requests
**GET** `/service-requests/my-requests`
- **Role**: CLIENT
- **Query Parameters**:
  - `page` (number, optional): Page number (default: 1)
  - `limit` (number, optional): Items per page (default: 20)
  - `status` (enum, optional): Filter by status
  - `search` (string, optional): Search in project name and description
- **Response**:
```json
{
  "data": [
    {
      "id": "uuid",
      "projectName": "string",
      "description": "string",
      "status": "PENDENTE",
      "priority": "MEDIA",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

#### 4. Get My Service Request by ID
**GET** `/service-requests/my-requests/:id`
- **Role**: CLIENT
- **Parameters**:
  - `id` (string, required): Service request UUID
- **Response**: Full service request object with all details

#### 5. Update My Service Request
**PATCH** `/service-requests/my-requests/:id`
- **Role**: CLIENT
- **Description**: Update service request (only if status is PENDENTE)
- **Body**: Same as create request (all fields optional)

#### 6. Cancel My Service Request
**DELETE** `/service-requests/my-requests/:id`
- **Role**: CLIENT
- **Description**: Cancel service request (only if status is PENDENTE)

#### 7. Get My Stats
**GET** `/service-requests/my-stats`
- **Role**: CLIENT
- **Response**:
```json
{
  "total": 25,
  "pending": 5,
  "approved": 15,
  "rejected": 3,
  "inProgress": 2
}
```

### Admin/Employee Endpoints

#### 8. Get All Service Requests
**GET** `/service-requests`
- **Role**: ADMIN, EMPLOYEE
- **Query Parameters**: Same as client endpoint plus `clientId`, `serviceId`
- **Response**: Paginated list of all service requests

#### 9. Get Service Request Stats
**GET** `/service-requests/stats`
- **Role**: ADMIN, EMPLOYEE
- **Response**:
```json
{
  "total": 500,
  "pending": 50,
  "approved": 300,
  "rejected": 100,
  "inProgress": 50,
  "byStatus": {
    "PENDENTE": 50,
    "APROVADO": 300,
    "REJEITADO": 100,
    "EM_ANDAMENTO": 50
  }
}
```

#### 10. Get Service Request by ID
**GET** `/service-requests/:id`
- **Role**: ADMIN, EMPLOYEE
- **Response**: Full service request details

#### 11. Approve Service Request
**POST** `/service-requests/:id/approve`
- **Role**: ADMIN, EMPLOYEE
- **Body**:
```json
{
  "notes": "string",
  "priority": "BAIXA|MEDIA|ALTA|CRITICA",
  "dueDate": "2024-01-01T00:00:00.000Z"
}
```
- **Response**: Updated service request with campaign and tasks created

#### 12. Confirm Service Request
**POST** `/service-requests/:id/confirm`
- **Role**: ADMIN, EMPLOYEE
- **Description**: Alternative endpoint for approval
- **Body**: Same as approve

#### 13. Reject Service Request
**POST** `/service-requests/:id/reject`
- **Role**: ADMIN, EMPLOYEE
- **Body**:
```json
{
  "rejectionReason": "string",
  "notes": "string"
}
```

#### 14. Assign Service Request
**POST** `/service-requests/:id/assign`
- **Role**: ADMIN
- **Body**:
```json
{
  "employeeIds": ["uuid"],
  "priority": "BAIXA|MEDIA|ALTA|CRITICA",
  "dueDate": "2024-01-01T00:00:00.000Z",
  "notes": "string"
}
```

---

# CAMPAIGNS MODULE

## Base URL: `/campaigns`

### Admin/Employee Endpoints

#### 1. Get All Campaigns
**GET** `/campaigns`
- **Role**: ADMIN, EMPLOYEE
- **Permissions**: READ_CAMPAIGNS
- **Query Parameters**:
  - `page` (number): Page number (default: 1)
  - `limit` (number): Items per page (default: 20)
  - `search` (string): Search in name and description
  - `status` (string): Filter by campaign status
  - `clientId` (string): Filter by client
  - `sortBy` (string): Sort field (name, startDate, endDate, createdAt)
  - `sortOrder` (string): asc or desc (default: desc)
- **Response**:
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "string",
      "description": "string",
      "status": "ATIVO",
      "clientId": "uuid",
      "startDate": "2024-01-01T00:00:00.000Z",
      "endDate": "2024-01-01T00:00:00.000Z",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

#### 2. Get My Campaigns (Employee)
**GET** `/campaigns/my-campaigns`
- **Role**: EMPLOYEE
- **Permissions**: READ_CAMPAIGNS
- **Query Parameters**: Same as get all campaigns
- **Description**: Returns campaigns assigned to the authenticated employee

#### 3. Get Client Campaigns
**GET** `/campaigns/client/:clientId`
- **Role**: ADMIN, EMPLOYEE, CLIENT
- **Permissions**: READ_CAMPAIGNS
- **Description**: Get campaigns for a specific client. Clients can only access their own campaigns.
- **Parameters**:
  - `clientId` (string): Client UUID

#### 4. Get My Client Campaigns
**GET** `/campaigns/client`
- **Role**: CLIENT
- **Permissions**: READ_CAMPAIGNS
- **Description**: Get campaigns for the authenticated client

#### 5. Get Campaign by ID
**GET** `/campaigns/:id`
- **Role**: ADMIN, EMPLOYEE, CLIENT
- **Permissions**: READ_CAMPAIGNS
- **Response**:
```json
{
  "id": "uuid",
  "name": "string",
  "description": "string",
  "status": "ATIVO",
  "clientId": "uuid",
  "serviceId": "uuid",
  "startDate": "2024-01-01T00:00:00.000Z",
  "endDate": "2024-01-01T00:00:00.000Z",
  "assignees": [
    {
      "id": "uuid",
      "employeeId": "uuid",
      "employee": {
        "id": "uuid",
        "user": {
          "name": "string",
          "email": "string"
        }
      }
    }
  ],
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

#### 6. Assign Employees to Campaign
**POST** `/campaigns/:id/assign-employees`
- **Role**: ADMIN, EMPLOYEE
- **Permissions**: WRITE_CAMPAIGNS
- **Body**:
```json
{
  "employeeIds": ["uuid"]
}
```
- **Response**: Updated campaign with assignees

#### 7. Remove Employees from Campaign
**DELETE** `/campaigns/:id/employees`
- **Role**: ADMIN, EMPLOYEE
- **Permissions**: WRITE_CAMPAIGNS
- **Body**:
```json
{
  "employeeIds": ["uuid"]
}
```

---

# TASKS MODULE

## Base URL: `/tasks`

### General Endpoints

#### 1. Create Task
**POST** `/tasks`
- **Role**: ADMIN, EMPLOYEE
- **Body**:
```json
{
  "title": "string",
  "description": "string",
  "serviceId": "uuid",
  "clientId": "uuid",
  "campaignId": "uuid",
  "status": "BACKLOG",
  "priority": "MEDIA",
  "progress": 0,
  "dueDate": "2024-01-01T00:00:00.000Z",
  "employeeIds": ["uuid"]
}
```
- **Response**:
```json
{
  "id": "uuid",
  "title": "string",
  "description": "string",
  "status": "BACKLOG",
  "priority": "MEDIA",
  "progress": 0,
  "dueDate": "2024-01-01T00:00:00.000Z",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

#### 2. Get All Tasks
**GET** `/tasks`
- **Role**: ADMIN, EMPLOYEE
- **Query Parameters**:
  - `page` (number): Page number (default: 1)
  - `limit` (number): Items per page (default: 20)
  - `clientId` (string): Filter by client
  - `serviceId` (string): Filter by service
  - `campaignId` (string): Filter by campaign
  - `employeeId` (string): Filter by assigned employee
  - `status` (enum): Filter by status
  - `priority` (enum): Filter by priority
  - `search` (string): Search in title and description
  - `dueDateFrom` (date): Filter tasks due after this date
  - `dueDateTo` (date): Filter tasks due before this date
  - `overdue` (boolean): Filter overdue tasks
  - `sortBy` (string): Sort field (default: createdAt)
  - `sortOrder` (string): asc or desc (default: desc)

#### 3. Get My Tasks (Employee)
**GET** `/tasks/my-tasks`
- **Role**: EMPLOYEE
- **Description**: Get tasks assigned to the authenticated employee
- **Query Parameters**: Same as get all tasks

#### 4. Get My Client Tasks
**GET** `/tasks/client`
- **Role**: CLIENT
- **Description**: Get tasks for the authenticated client

#### 5. Get Client Tasks
**GET** `/tasks/client/:clientId`
- **Role**: ADMIN, EMPLOYEE, CLIENT
- **Description**: Get tasks for a specific client. Clients can only access their own tasks.

#### 6. Get Kanban Board
**GET** `/tasks/kanban`
- **Query Parameters**:
  - `clientId` (string, optional): Filter by client
  - `employeeId` (string, optional): Filter by employee
- **Response**:
```json
{
  "BACKLOG": [
    {
      "id": "uuid",
      "title": "string",
      "priority": "MEDIA",
      "dueDate": "2024-01-01T00:00:00.000Z"
    }
  ],
  "EM_ANDAMENTO": [],
  "REVISAO": [],
  "CONCLUIDO": []
}
```

#### 7. Get Task Stats
**GET** `/tasks/stats`
- **Query Parameters**:
  - `clientId` (string, optional): Filter by client
  - `employeeId` (string, optional): Filter by employee
- **Response**:
```json
{
  "total": 100,
  "byStatus": {
    "BACKLOG": 20,
    "EM_ANDAMENTO": 30,
    "REVISAO": 25,
    "CONCLUIDO": 25
  },
  "byPriority": {
    "BAIXA": 20,
    "MEDIA": 50,
    "ALTA": 25,
    "CRITICA": 5
  },
  "overdue": 5,
  "completedThisMonth": 15
}
```

#### 8. Get Status Options
**GET** `/tasks/status-options`
- **Response**:
```json
{
  "statuses": [
    "BACKLOG",
    "EM_ANDAMENTO", 
    "REVISAO",
    "CONCLUIDO",
    "ARQUIVADO",
    "ATRASADO"
  ]
}
```

#### 9. Check Overdue Tasks
**POST** `/tasks/check-overdue`
- **Role**: ADMIN, EMPLOYEE
- **Description**: Manually trigger overdue task status update
- **Response**:
```json
{
  "updatedTasks": 3,
  "message": "Updated 3 overdue tasks to ATRASADO status"
}
```

#### 10. Get Approval Center
**GET** `/tasks/approval-center`
- **Role**: CLIENT, EMPLOYEE
- **Description**: Get tasks with REVISAO status for approval
- **Query Parameters**: Same as get all tasks
- **Response**: Tasks filtered by REVISAO status based on user role

#### 11. Approve Task
**POST** `/tasks/:id/approve`
- **Role**: CLIENT
- **Description**: Approve a task in REVISAO status
- **Body**:
```json
{
  "comment": "string"
}
```
- **Response**: Updated task and potentially archived campaign

#### 12. Toggle Task Status
**POST** `/tasks/:id/toggle-status`
- **Role**: ADMIN, EMPLOYEE
- **Description**: Smart status progression (BACKLOG → EM_ANDAMENTO → REVISAO → CONCLUIDO)
- **Response**: Task with updated status

#### 13. Archive Task
**POST** `/tasks/:id/archive`
- **Role**: ADMIN, EMPLOYEE
- **Description**: Archive a task
- **Response**: Archived task

#### 14. Get Task by ID
**GET** `/tasks/:id`
- **Response**: Full task details including assignees, comments, and files

#### 15. Update Task
**PATCH** `/tasks/:id`
- **Role**: ADMIN, EMPLOYEE
- **Body**: Same as create task (all fields optional)

#### 16. Update Task Status
**PATCH** `/tasks/:id/status`
- **Role**: ADMIN, EMPLOYEE
- **Description**: Update task status with role-based restrictions
- **Body**:
```json
{
  "status": "EM_ANDAMENTO"
}
```

#### 17. Update Task Progress
**PATCH** `/tasks/:id/progress`
- **Body**:
```json
{
  "progress": 75
}
```

#### 18. Assign Employees to Task
**POST** `/tasks/:id/assign`
- **Role**: ADMIN, EMPLOYEE
- **Body**:
```json
{
  "employeeIds": ["uuid"]
}
```

#### 19. Add Comment to Task
**POST** `/tasks/:id/comments`
- **Body**:
```json
{
  "content": "string"
}
```

#### 20. Add Inspiration File
**POST** `/tasks/:id/files/inspiration`
- **Content-Type**: `multipart/form-data`
- **Body**:
  - `file` (file): File to upload
  - `description` (string, optional): File description

#### 21. Add Deliverable File
**POST** `/tasks/:id/files/deliverable`
- **Role**: ADMIN, EMPLOYEE
- **Content-Type**: `multipart/form-data`
- **Body**:
  - `file` (file): File to upload
  - `description` (string, optional): File description

#### 22. Add File by URL
**POST** `/tasks/:id/files/url`
- **Body**:
```json
{
  "fileName": "string",
  "fileUrl": "string",
  "description": "string",
  "fileType": "INSPIRATION|DELIVERABLE"
}
```

#### 23. Remove File
**DELETE** `/tasks/:id/files/:fileId`
- **Description**: Remove file from task

#### 24. Delete Task
**DELETE** `/tasks/:id`
- **Role**: ADMIN, EMPLOYEE

---

## Status Enums

### ServiceRequestStatus
- `PENDENTE`: Initial status when created
- `APROVADO`: Approved by admin/employee
- `REJEITADO`: Rejected by admin/employee
- `EM_ANDAMENTO`: Being worked on
- `CONCLUIDO`: Completed
- `CANCELADO`: Cancelled by client

### TaskStatus
- `BACKLOG`: Not started
- `EM_ANDAMENTO`: In progress
- `REVISAO`: Under review
- `CONCLUIDO`: Completed
- `ARQUIVADO`: Archived
- `ATRASADO`: Overdue (automatically set)

### TaskPriority
- `BAIXA`: Low priority
- `MEDIA`: Medium priority
- `ALTA`: High priority
- `CRITICA`: Critical priority

### TaskFileType
- `INSPIRATION`: Reference/inspiration files
- `DELIVERABLE`: Final deliverable files

---

## Error Responses

All endpoints may return these standard error responses:

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "Validation error details",
  "error": "Bad Request"
}
```

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

### 403 Forbidden
```json
{
  "statusCode": 403,
  "message": "Insufficient permissions",
  "error": "Forbidden"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Resource not found",
  "error": "Not Found"
}
```
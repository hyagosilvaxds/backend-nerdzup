# 📋 Tasks and Service Request Workflow Documentation

## 📖 Overview

Este documento descreve o sistema completo de gerenciamento de tarefas e fluxo de trabalho para solicitações de serviço. O sistema permite que administradores atribuam solicitações de serviço a funcionários, criando tarefas automaticamente com status BACKLOG.

## 🔄 Workflow: Service Request → Task Assignment

### 1. Service Request Creation (Cliente)
```
Cliente cria solicitação → Status: PENDING → Aguarda atribuição pelo Admin
```

### 2. Admin Assignment
```
Admin atribui funcionários → Deduz créditos → Cria Task → Status: APPROVED
```

### 3. Task Execution (Funcionários)
```
BACKLOG → ANDAMENTO → REVISAO → CONCLUIDO/ARQUIVADO
```

---

## 🎯 Service Request Assignment Endpoint

### POST `/service-requests/:id/assign`

**Descrição**: Admin atribui uma solicitação de serviço a funcionários, criando uma task automaticamente.

**Permissões**: Apenas `ADMIN`

#### Request Body
```json
{
  "employeeIds": ["employee_id_1", "employee_id_2"],
  "priority": "ALTA",
  "dueDate": "2024-12-31T23:59:59.000Z",
  "notes": "Projeto urgente para lançamento"
}
```

#### Request Body Fields
- `employeeIds` (array, required) - Array com IDs dos funcionários
- `priority` (enum, optional) - Prioridade da task (`BAIXA`, `MEDIA`, `ALTA`, `URGENTE`)
- `dueDate` (string, optional) - Data limite no formato ISO
- `notes` (string, optional) - Observações sobre a atribuição

#### Response (201 Created)
```json
{
  "message": "Service request assigned and task created successfully",
  "serviceRequest": {
    "id": "service_request_id",
    "status": "APPROVED",
    "taskId": "created_task_id",
    "approvedBy": "admin_user_id",
    "approvedAt": "2024-01-01T12:00:00.000Z",
    "service": {
      "id": "service_id",
      "displayName": "Criação de Landing Page",
      "credits": 50
    },
    "client": {
      "id": "client_id",
      "fullName": "João Silva",
      "user": {
        "email": "joao@email.com"
      }
    },
    "task": {
      "id": "task_id",
      "title": "Criação de Landing Page - João Silva",
      "status": "BACKLOG",
      "progress": 0,
      "assignees": [
        {
          "employee": {
            "id": "employee_id_1",
            "name": "Maria Designer",
            "position": "UI/UX Designer"
          }
        }
      ]
    }
  },
  "assignedEmployees": [
    {
      "id": "employee_id_1",
      "name": "Maria Designer",
      "position": "UI/UX Designer",
      "email": "maria@nerdzup.com"
    }
  ]
}
```

#### Possible Errors
- `404 Not Found` - Solicitação não encontrada ou já processada
- `400 Bad Request` - Funcionário inválido ou cliente sem créditos
- `403 Forbidden` - Usuário não é admin

---

## 📝 Task Management Endpoints

### 1. Get All Tasks
**GET** `/tasks`

#### Query Parameters
```typescript
{
  clientId?: string;           // Filtrar por cliente
  serviceId?: string;          // Filtrar por serviço
  campaignId?: string;         // Filtrar por campanha
  employeeId?: string;         // Filtrar por funcionário atribuído
  status?: TaskStatus;         // BACKLOG, ANDAMENTO, REVISAO, CONCLUIDO, ATRASADO, ARQUIVADO
  priority?: TaskPriority;     // BAIXA, MEDIA, ALTA, URGENTE
  search?: string;             // Buscar por título ou descrição
  dueDateFrom?: string;        // Data inicial (ISO format)
  dueDateTo?: string;          // Data final (ISO format)
  overdue?: boolean;           // Apenas tarefas atrasadas
  sortBy?: string;             // createdAt, dueDate, priority, progress, title
  sortOrder?: "asc" | "desc";  // Ordem de classificação
  page?: number;               // Página (default: 1)
  limit?: number;              // Itens por página (default: 20)
}
```

#### Response
```json
{
  "data": [
    {
      "id": "task_id",
      "title": "Criação de Landing Page - João Silva",
      "description": "Desenvolver landing page responsiva",
      "status": "BACKLOG",
      "priority": "ALTA",
      "progress": 0,
      "dueDate": "2024-12-31T23:59:59.000Z",
      "createdAt": "2024-01-01T12:00:00.000Z",
      "service": {
        "displayName": "Criação de Landing Page",
        "iconUrl": "/uploads/services/landing-page.png"
      },
      "client": {
        "fullName": "João Silva",
        "user": { "email": "joao@email.com" }
      },
      "assignees": [
        {
          "employee": {
            "name": "Maria Designer",
            "position": "UI/UX Designer"
          }
        }
      ]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3
  }
}
```

### 2. Get Single Task
**GET** `/tasks/:id`

#### Response
```json
{
  "id": "task_id",
  "title": "Criação de Landing Page - João Silva",
  "description": "Desenvolver landing page responsiva",
  "status": "ANDAMENTO",
  "priority": "ALTA",
  "progress": 35,
  "dueDate": "2024-12-31T23:59:59.000Z",
  "completedAt": null,
  "createdAt": "2024-01-01T12:00:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z",
  "service": {
    "id": "service_id",
    "displayName": "Criação de Landing Page",
    "description": "Landing page responsiva e otimizada",
    "credits": 50,
    "estimatedDays": 5
  },
  "client": {
    "id": "client_id",
    "fullName": "João Silva",
    "user": { "email": "joao@email.com" }
  },
  "campaign": {
    "id": "campaign_id",
    "name": "Lançamento Produto X"
  },
  "assignees": [
    {
      "id": "assignment_id",
      "assignedAt": "2024-01-01T12:00:00.000Z",
      "employee": {
        "id": "employee_id",
        "name": "Maria Designer",
        "position": "UI/UX Designer"
      }
    }
  ],
  "files": [
    {
      "id": "file_id",
      "fileName": "wireframe.pdf",
      "fileUrl": "/uploads/task-files/wireframe.pdf",
      "fileType": "INSPIRATION",
      "description": "Wireframes do cliente",
      "uploadedAt": "2024-01-02T14:00:00.000Z"
    }
  ],
  "comments": [
    {
      "id": "comment_id",
      "content": "Iniciando o desenvolvimento",
      "createdAt": "2024-01-15T09:00:00.000Z",
      "author": {
        "email": "maria@nerdzup.com"
      }
    }
  ],
  "serviceRequest": {
    "id": "service_request_id",
    "projectName": "Landing Page Produto X",
    "targetAudience": "Jovens 18-35 anos",
    "documentUrls": ["/uploads/brief.pdf"]
  }
}
```

### 3. Update Task Status
**PATCH** `/tasks/:id/status`

#### Request Body
```json
{
  "status": "ANDAMENTO"
}
```

#### Valid Status Values
- `BACKLOG` - Tarefa na fila
- `ANDAMENTO` - Em progresso
- `REVISAO` - Em revisão
- `CONCLUIDO` - Finalizada
- `ATRASADO` - Fora do prazo
- `ARQUIVADO` - Arquivada

#### Response
```json
{
  "id": "task_id",
  "status": "ANDAMENTO",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

### 4. Update Task Progress
**PATCH** `/tasks/:id/progress`

#### Request Body
```json
{
  "progress": 75
}
```

#### Response
```json
{
  "id": "task_id",
  "progress": 75,
  "updatedAt": "2024-01-20T16:45:00.000Z"
}
```

### 5. Assign Employees to Task
**POST** `/tasks/:id/assign`

**Permissões**: `ADMIN`, `EMPLOYEE`

#### Request Body
```json
{
  "employeeIds": ["employee_id_1", "employee_id_2"]
}
```

#### Response
```json
{
  "message": "Employees assigned successfully",
  "assignees": [
    {
      "employee": {
        "id": "employee_id_1",
        "name": "Maria Designer",
        "position": "UI/UX Designer"
      },
      "assignedAt": "2024-01-15T14:00:00.000Z"
    }
  ]
}
```

### 6. Add Task Comment
**POST** `/tasks/:id/comments`

#### Request Body
```json
{
  "content": "Primeira versão enviada para revisão do cliente"
}
```

#### Response
```json
{
  "id": "comment_id",
  "content": "Primeira versão enviada para revisão do cliente",
  "createdAt": "2024-01-20T11:00:00.000Z",
  "author": {
    "email": "maria@nerdzup.com"
  }
}
```

### 7. Upload Inspiration File (Cliente)
**POST** `/tasks/:id/files/inspiration`

#### Request (Form Data)
- `file` (file) - Arquivo de inspiração
- `description` (string, optional) - Descrição do arquivo

#### Response
```json
{
  "id": "file_id",
  "fileName": "referencia-design.jpg",
  "fileUrl": "/uploads/task-files/referencia-design.jpg",
  "fileType": "INSPIRATION",
  "description": "Referência de design aprovada",
  "uploadedAt": "2024-01-02T14:00:00.000Z"
}
```

### 8. Upload Deliverable File (Funcionário)
**POST** `/tasks/:id/files/deliverable`

**Permissões**: `ADMIN`, `EMPLOYEE`

#### Request (Form Data)
- `file` (file) - Arquivo entregável
- `description` (string, optional) - Descrição do arquivo

#### Response
```json
{
  "id": "file_id",
  "fileName": "landing-page-v1.zip",
  "fileUrl": "/uploads/task-files/landing-page-v1.zip",
  "fileType": "DELIVERABLE",
  "description": "Primeira versão da landing page",
  "uploadedAt": "2024-01-20T16:00:00.000Z"
}
```

### 9. Add File by URL
**POST** `/tasks/:id/files/url`

#### Request Body
```json
{
  "fileName": "design-final.figma",
  "fileUrl": "https://figma.com/file/abc123",
  "description": "Design final no Figma",
  "fileType": "DELIVERABLE"
}
```

### 10. Get Kanban Board
**GET** `/tasks/kanban`

#### Query Parameters
- `clientId` (string, optional) - Filtrar por cliente
- `employeeId` (string, optional) - Filtrar por funcionário

#### Response
```json
{
  "BACKLOG": [
    {
      "id": "task_1",
      "title": "Criação de Logo",
      "priority": "ALTA",
      "dueDate": "2024-02-01T00:00:00.000Z",
      "client": { "fullName": "Maria Santos" },
      "assignees": [...]
    }
  ],
  "ANDAMENTO": [
    {
      "id": "task_2",
      "title": "Landing Page",
      "priority": "MEDIA",
      "progress": 60,
      "assignees": [...]
    }
  ],
  "REVISAO": [...],
  "CONCLUIDO": [...],
  "ARQUIVADO": [...]
}
```

### 11. Get Task Statistics
**GET** `/tasks/stats`

#### Query Parameters
- `clientId` (string, optional) - Estatísticas por cliente
- `employeeId` (string, optional) - Estatísticas por funcionário

#### Response
```json
{
  "total": 45,
  "byStatus": {
    "BACKLOG": 8,
    "ANDAMENTO": 12,
    "REVISAO": 5,
    "CONCLUIDO": 18,
    "ATRASADO": 2,
    "ARQUIVADO": 0
  },
  "byPriority": {
    "BAIXA": 10,
    "MEDIA": 20,
    "ALTA": 12,
    "URGENTE": 3
  },
  "overdue": 2,
  "completionRate": 75.5,
  "averageCompletionDays": 4.2
}
```

### 12. Create Task (Manual)
**POST** `/tasks`

**Permissões**: `ADMIN`, `EMPLOYEE`

#### Request Body
```json
{
  "title": "Revisão de Estratégia Digital",
  "description": "Análise e revisão da estratégia atual",
  "serviceId": "service_id",
  "clientId": "client_id",
  "campaignId": "campaign_id",
  "priority": "MEDIA",
  "dueDate": "2024-03-15T23:59:59.000Z",
  "employeeIds": ["employee_id_1"]
}
```

### 13. Update Task
**PATCH** `/tasks/:id`

**Permissões**: `ADMIN`, `EMPLOYEE`

#### Request Body
```json
{
  "title": "Novo título da tarefa",
  "description": "Nova descrição",
  "priority": "ALTA",
  "dueDate": "2024-04-01T23:59:59.000Z"
}
```

### 14. Delete File
**DELETE** `/tasks/:id/files/:fileId`

#### Response
```
204 No Content
```

### 15. Delete Task
**DELETE** `/tasks/:id`

**Permissões**: `ADMIN`, `EMPLOYEE`

#### Response
```
204 No Content
```

---

## 🔄 Complete Workflow Examples

### Example 1: Service Request to Task Completion

#### Step 1: Cliente cria solicitação
```http
POST /service-requests
Content-Type: application/json

{
  "serviceId": "landing_page_service",
  "projectName": "Landing Page Produto X",
  "description": "Preciso de uma landing page moderna",
  "targetAudience": "Jovens 18-30 anos"
}
```

#### Step 2: Admin atribui funcionários
```http
POST /service-requests/sr_123/assign
Content-Type: application/json

{
  "employeeIds": ["designer_001", "dev_002"],
  "priority": "ALTA",
  "dueDate": "2024-02-15T23:59:59.000Z",
  "notes": "Projeto prioritário para cliente premium"
}
```

#### Step 3: Funcionário inicia trabalho
```http
PATCH /tasks/task_456/status
Content-Type: application/json

{
  "status": "ANDAMENTO"
}
```

#### Step 4: Cliente adiciona arquivo de inspiração
```http
POST /tasks/task_456/files/inspiration
Content-Type: multipart/form-data

file: [arquivo_referencia.jpg]
description: "Layout que gostei como referência"
```

#### Step 5: Funcionário atualiza progresso
```http
PATCH /tasks/task_456/progress
Content-Type: application/json

{
  "progress": 50
}
```

#### Step 6: Funcionário adiciona comentário
```http
POST /tasks/task_456/comments
Content-Type: application/json

{
  "content": "Primeira versão do layout criada, enviando para aprovação"
}
```

#### Step 7: Funcionário envia entregável
```http
POST /tasks/task_456/files/deliverable
Content-Type: multipart/form-data

file: [landing_page_v1.zip]
description: "Primeira versão da landing page completa"
```

#### Step 8: Marcar como concluído
```http
PATCH /tasks/task_456/status
Content-Type: application/json

{
  "status": "CONCLUIDO"
}
```

---

## 🚨 Error Handling

### Common HTTP Status Codes
- `200 OK` - Sucesso
- `201 Created` - Recurso criado
- `204 No Content` - Sucesso sem conteúdo
- `400 Bad Request` - Dados inválidos
- `401 Unauthorized` - Não autenticado
- `403 Forbidden` - Sem permissão
- `404 Not Found` - Recurso não encontrado
- `422 Unprocessable Entity` - Validação falhou

### Error Response Format
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request",
  "details": [
    {
      "field": "employeeIds",
      "message": "employeeIds must be an array"
    }
  ]
}
```

---

## 🔐 Authentication & Permissions

### Authentication
Todos os endpoints requerem autenticação via JWT:
```http
Authorization: Bearer <jwt_token>
```

### Permission Levels

#### ADMIN
- Pode criar, editar e deletar qualquer task
- Pode atribuir service requests a funcionários
- Acesso completo a todos os endpoints

#### EMPLOYEE
- Pode ver tasks atribuídas a ele
- Pode atualizar status e progresso
- Pode adicionar comentários e arquivos entregáveis
- Pode criar tasks manuais

#### CLIENT
- Pode ver apenas suas próprias tasks
- Pode adicionar arquivos de inspiração
- Pode adicionar comentários
- Não pode alterar status ou progresso

---

## 📊 Task Status Flow

```
BACKLOG → ANDAMENTO → REVISAO → CONCLUIDO
    ↓         ↓          ↓          ↓
  ARQUIVADO ← ARQUIVADO ← ARQUIVADO ← ARQUIVADO
```

### Status Descriptions
- **BACKLOG**: Tarefa criada, aguardando início
- **ANDAMENTO**: Funcionário está trabalhando na tarefa
- **REVISAO**: Tarefa em revisão (cliente ou supervisor)
- **CONCLUIDO**: Tarefa finalizada com sucesso
- **ATRASADO**: Tarefa que passou do prazo (status automático)
- **ARQUIVADO**: Tarefa arquivada (não aparece em listagens normais)

---

## 🎯 Priority Levels

- **BAIXA**: Tarefas que podem ser feitas quando há tempo
- **MEDIA**: Prioridade padrão, fluxo normal
- **ALTA**: Tarefas importantes, devem ser priorizadas
- **URGENTE**: Máxima prioridade, drop everything

---

## 💡 Tips for Frontend Integration

### 1. Real-time Updates
Consider implementing WebSocket connections for real-time task updates.

### 2. File Upload Progress
Implement progress bars for file uploads using multipart forms.

### 3. Kanban Board
Use the `/tasks/kanban` endpoint to build drag-and-drop interfaces.

### 4. Filtering & Search
Utilize query parameters for advanced filtering and search functionality.

### 5. Pagination
Always implement pagination for task lists to improve performance.

### 6. Error Handling
Implement proper error handling for network failures and validation errors.

### 7. Caching
Cache task data where appropriate to reduce API calls.

---

Esta documentação cobre todo o fluxo de trabalho desde a criação de solicitações de serviço até a conclusão de tarefas, incluindo todos os endpoints necessários para integração com o frontend.
# Employee Task Creation Endpoints

## Overview
Estes endpoints permitem que employees criem tasks para si mesmos ou para outros employees, com base nas permissões adequadas.

## Permissões Necessárias

### Novas Permissões Criadas:
- `READ_TASKS` - Ler tasks
- `WRITE_TASKS` - Criar/editar tasks gerais
- `DELETE_TASKS` - Deletar tasks
- `CREATE_TASKS_FOR_OTHERS` - Criar tasks para outros employees

---

## Endpoints

### **1. Criar Task para Outro Employee**
**POST** `/tasks/for-employee`

**Permissões**: `CREATE_TASKS_FOR_OTHERS`
**Roles**: `ADMIN`, `EMPLOYEE`

#### Request Body:
```json
{
  "title": "Revisar documentação da API",
  "description": "Revisar e atualizar a documentação da API de clientes",
  "priority": "ALTA",
  "status": "BACKLOG",
  "dueDate": "2024-12-31T23:59:59.000Z",
  "assignedToEmployeeId": "cmezlafg40009vbibx4h2k5nm",
  "clientId": "client_123",
  "serviceId": "service_456",
  "tags": ["documentação", "api", "revisão"],
  "estimatedHours": 4
}
```

#### Validações:
- `title`: string obrigatória
- `description`: string opcional
- `status`: enum `TaskStatus` opcional (padrão: BACKLOG)
- `priority`: enum `TaskPriority` opcional (padrão: MEDIA)
- `dueDate`: data ISO string opcional
- `assignedToEmployeeId`: UUID obrigatório do employee destinatário
- `clientId`: UUID opcional do cliente (usa padrão se não fornecido)
- `serviceId`: UUID opcional do serviço (usa padrão se não fornecido)
- `tags`: array de strings opcional
- `estimatedHours`: number opcional

#### Response (201 Created):
```json
{
  "id": "task_123",
  "title": "Revisar documentação da API",
  "description": "Revisar e atualizar a documentação da API de clientes",
  "status": "BACKLOG",
  "priority": "ALTA",
  "dueDate": "2024-12-31T23:59:59.000Z",
  "estimatedHours": "4",
  "tags": ["documentação", "api", "revisão"],
  "clientContext": "Contexto relacionado ao cliente, se relevante",
  "createdAt": "2025-09-15T...",
  "updatedAt": "2025-09-15T...",
  "createdByUser": {
    "id": "user_id",
    "email": "employee@empresa.com",
    "role": "EMPLOYEE"
  },
  "assignees": [
    {
      "id": "assignee_id",
      "employeeId": "cmezlafg40009vbibx4h2k5nm",
      "assignedAt": "2025-09-15T...",
      "employee": {
        "id": "cmezlafg40009vbibx4h2k5nm",
        "name": "João Silva",
        "position": "Desenvolvedor",
        "user": {
          "email": "joao@empresa.com"
        }
      }
    }
  ]
}
```

---

### **2. Criar Task para Si Mesmo**
**POST** `/tasks/my-task`

**Permissões**: Nenhuma (apenas ser EMPLOYEE)
**Roles**: `EMPLOYEE`

#### Request Body:
```json
{
  "title": "Implementar nova feature",
  "description": "Implementar sistema de notificações push",
  "priority": "MEDIA",
  "status": "BACKLOG",
  "dueDate": "2024-12-25T18:00:00.000Z",
  "clientContext": "Feature solicitada pelo cliente Premium",
  "tags": ["feature", "notificações", "push"],
  "estimatedHours": "8"
}
```

#### Validações:
- Mesmas validações do endpoint anterior, exceto `assignedToEmployeeId` que é automaticamente definido como o employee logado

#### Response (201 Created):
```json
{
  "id": "task_456",
  "title": "Implementar nova feature",
  "description": "Implementar sistema de notificações push",
  "status": "BACKLOG",
  "priority": "MEDIA",
  "dueDate": "2024-12-25T18:00:00.000Z",
  "estimatedHours": "8",
  "tags": ["feature", "notificações", "push"],
  "clientContext": "Feature solicitada pelo cliente Premium",
  "createdAt": "2025-09-15T...",
  "updatedAt": "2025-09-15T...",
  "createdByUser": {
    "id": "user_id",
    "email": "employee@empresa.com",
    "role": "EMPLOYEE"
  },
  "assignees": [
    {
      "id": "assignee_id",
      "employeeId": "current_employee_id",
      "assignedAt": "2025-09-15T...",
      "employee": {
        "id": "current_employee_id",
        "name": "Employee Name",
        "position": "Desenvolvedor",
        "user": {
          "email": "employee@empresa.com"
        }
      }
    }
  ]
}
```

---

### **3. Endpoint Existente Atualizado**
**POST** `/tasks`

**Permissões**: `WRITE_TASKS` (nova permissão adicionada)
**Roles**: `ADMIN`, `EMPLOYEE`

Este endpoint existente foi atualizado para incluir validação de permissões.

---

## Casos de Uso

### 1. **Team Leader criando task para subordinado**
- Employee com permissão `CREATE_TASKS_FOR_OTHERS` usa `POST /tasks/for-employee`
- Especifica o `assignedToEmployeeId` do subordinado
- Task é criada e atribuída automaticamente

### 2. **Employee criando task pessoal**
- Qualquer employee usa `POST /tasks/my-task`
- Task é automaticamente atribuída a ele mesmo
- Não necessita permissões especiais

### 3. **Admin criando task complexa**
- Admin usa `POST /tasks` (endpoint original) para tasks mais complexas ligadas a serviços/clientes
- Usa `POST /tasks/for-employee` para tasks internas simples

---

## Errors

### 400 Bad Request
```json
{
  "message": "Employee profile not found",
  "error": "Bad Request",
  "statusCode": 400
}
```

### 403 Forbidden
```json
{
  "message": "Forbidden resource",
  "error": "Forbidden",
  "statusCode": 403
}
```

### 404 Not Found
```json
{
  "message": "Assigned employee not found",
  "error": "Not Found",
  "statusCode": 404
}
```

---

---

## Service Request Employee Assignment Endpoints

### **4. Atribuir Employees a Service Request**
**POST** `/service-requests/:id/assign-employees`

**Permissões**: Apenas `ADMIN`
**Roles**: `ADMIN`

#### Request Body:
```json
{
  "employeeIds": ["cmezlafg40009vbibx4h2k5nm", "employee_id_2"],
  "notes": "Atribuição para projeto urgente do cliente premium"
}
```

#### Validações:
- `employeeIds`: array de UUIDs obrigatório (mínimo 1 employee)
- `notes`: string opcional para contexto da atribuição

#### Response (200 OK):
```json
{
  "message": "Employees assigned successfully",
  "serviceRequest": {
    "id": "service_request_id",
    "projectName": "Website E-commerce",
    "status": "APPROVED",
    "client": {
      "id": "client_id",
      "name": "Cliente Premium Ltd"
    }
  },
  "assignedEmployees": [
    {
      "id": "assignment_id_1",
      "employeeId": "cmezlafg40009vbibx4h2k5nm",
      "assignedAt": "2025-09-15T...",
      "assignedBy": "admin_user_id",
      "notes": "Atribuição para projeto urgente do cliente premium",
      "employee": {
        "id": "cmezlafg40009vbibx4h2k5nm",
        "name": "João Silva",
        "position": "Desenvolvedor Frontend",
        "user": {
          "email": "joao.silva@empresa.com"
        }
      }
    },
    {
      "id": "assignment_id_2",
      "employeeId": "employee_id_2",
      "assignedAt": "2025-09-15T...",
      "assignedBy": "admin_user_id",
      "notes": "Atribuição para projeto urgente do cliente premium",
      "employee": {
        "id": "employee_id_2",
        "name": "Maria Santos",
        "position": "Designer UX/UI",
        "user": {
          "email": "maria.santos@empresa.com"
        }
      }
    }
  ]
}
```

---

### **5. Remover Employee de Service Request**
**DELETE** `/service-requests/:id/employees/:employeeId`

**Permissões**: Apenas `ADMIN`
**Roles**: `ADMIN`

#### Response (200 OK):
```json
{
  "message": "Employee removed from service request successfully",
  "removedAssignment": {
    "employeeId": "cmezlafg40009vbibx4h2k5nm",
    "employeeName": "João Silva",
    "removedAt": "2025-09-15T...",
    "removedBy": "admin_user_id"
  }
}
```

#### Errors:
**404 Not Found** - Employee não está atribuído ao service request:
```json
{
  "message": "Employee assignment not found",
  "error": "Not Found",
  "statusCode": 404
}
```

---

### **6. Listar Employees Atribuídos**
**GET** `/service-requests/:id/employees`

**Permissões**: `ADMIN` ou `EMPLOYEE`
**Roles**: `ADMIN`, `EMPLOYEE`

#### Response (200 OK):
```json
{
  "serviceRequestId": "service_request_id",
  "projectName": "Website E-commerce",
  "assignedEmployees": [
    {
      "id": "assignment_id_1",
      "employeeId": "cmezlafg40009vbibx4h2k5nm",
      "assignedAt": "2025-09-15T...",
      "assignedBy": "admin_user_id",
      "notes": "Atribuição para projeto urgente",
      "employee": {
        "id": "cmezlafg40009vbibx4h2k5nm",
        "name": "João Silva",
        "position": "Desenvolvedor Frontend",
        "user": {
          "email": "joao.silva@empresa.com"
        }
      }
    }
  ],
  "totalAssigned": 1
}
```

---

## Casos de Uso para Service Request Assignment

### 1. **Admin atribuindo equipe a projeto**
- Admin usa `POST /service-requests/:id/assign-employees`
- Especifica múltiplos `employeeIds` e contexto nas `notes`
- Sistema envia notificações automáticas para todos os employees atribuídos

### 2. **Remoção de employee do projeto**
- Admin usa `DELETE /service-requests/:id/employees/:employeeId`
- Employee é removido e recebe notificação de desatribuição
- Outros employees permanecem atribuídos

### 3. **Consulta de equipe do projeto**
- Qualquer employee/admin pode ver quem está atribuído via `GET /service-requests/:id/employees`
- Útil para coordenação e planejamento de recursos

---

## Notificações Automáticas

O sistema envia automaticamente notificações quando:
- **Employee é atribuído**: Notificação `SERVICE_REQUEST_ASSIGNED`
- **Employee é removido**: Notificação `SERVICE_REQUEST_UNASSIGNED`

---

## Migration Necessária

Para ativar essas funcionalidades, execute:

```bash
npx prisma db push
# ou
npx prisma migrate dev
```

Isso criará as novas permissões e tabelas no banco de dados. Depois, atribua as permissões adequadas aos employees conforme necessário.
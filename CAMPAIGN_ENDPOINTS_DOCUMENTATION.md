# Campaign Endpoints Documentation

## Overview
Este documento descreve os endpoints para gerenciamento de campanhas geradas automaticamente quando um service request é aprovado pelo admin. Quando um service request é marcado como **APPROVED**, o sistema:

1. Debita os créditos do cliente
2. Cria automaticamente uma **Campaign**
3. Cria uma **Task** vinculada à campanha
4. Permite que employees atribuídos trabalhem na campanha

---

## Campaign Creation Flow

### 1. **Aprovação Automática de Service Request → Campaign**
Quando o admin aprova um service request via `POST /service-requests/:id/approve`, o sistema:

- ✅ Debita automaticamente os créditos do cliente
- ✅ Cria uma **Campaign** com base no service request
- ✅ Cria uma **Task** inicial vinculada à campanha
- ✅ Atribui employees (se fornecidos no processo de aprovação)

**Exemplo de resposta após aprovação:**
```json
{
  "message": "Service request approved successfully",
  "serviceRequest": {
    "id": "sr_123",
    "status": "APPROVED",
    "campaignId": "campaign_456", // ← Campanha criada automaticamente
    "taskId": "task_789",         // ← Task inicial criada
    "creditsCost": 150
  },
  "campaign": {
    "id": "campaign_456",
    "name": "Website E-commerce - Cliente Premium Ltd",
    "status": "ACTIVE",
    "startDate": "2025-09-15T...",
    "clientId": "client_123"
  }
}
```

---

## Campaign Management Endpoints

### **1. Listar Campanhas dos Employees**
**GET** `/campaigns/my-campaigns`

**Permissões**: `READ_CAMPAIGNS`
**Roles**: `EMPLOYEE`

Lista todas as campanhas que o employee está atribuído.

#### Response (200 OK):
```json
{
  "campaigns": [
    {
      "id": "campaign_456",
      "name": "Website E-commerce - Cliente Premium",
      "description": "Desenvolvimento de website e-commerce completo",
      "status": "ACTIVE",
      "startDate": "2025-09-15T...",
      "endDate": "2025-10-15T...",
      "client": {
        "id": "client_123",
        "fullName": "Cliente Premium Ltd",
        "companyName": "Premium Company",
        "user": {
          "email": "cliente@premium.com"
        }
      },
      "assignees": [
        {
          "id": "assignment_id",
          "employeeId": "employee_id",
          "assignedAt": "2025-09-15T...",
          "employee": {
            "id": "employee_id",
            "name": "João Silva",
            "position": "Desenvolvedor Frontend",
            "user": {
              "email": "joao@empresa.com"
            }
          }
        }
      ],
      "tasks": [
        {
          "id": "task_789",
          "title": "Website E-commerce - Cliente Premium",
          "status": "BACKLOG",
          "priority": "ALTA",
          "progress": 0,
          "estimatedHours": 40,
          "spentHours": 0,
          "dueDate": "2025-10-15T...",
          "service": {
            "id": "service_123",
            "name": "ecommerce-website",
            "displayName": "Website E-commerce",
            "credits": 150
          }
        }
      ],
      "files": [],
      "comments": [],
      "totals": {
        "estimatedHours": 40,
        "spentHours": 0,
        "credits": 150,
        "tasks": 1,
        "completedTasks": 0,
        "progress": 0
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "pages": 1
  }
}
```

---

### **2. Detalhes de uma Campanha**
**GET** `/campaigns/:id`

**Permissões**: `READ_CAMPAIGNS`
**Roles**: `ADMIN`, `EMPLOYEE`, `CLIENT`

Busca detalhes completos de uma campanha específica.

#### Response (200 OK):
```json
{
  "id": "campaign_456",
  "name": "Website E-commerce - Cliente Premium",
  "description": "Desenvolvimento de website e-commerce completo",
  "status": "ACTIVE",
  "startDate": "2025-09-15T...",
  "endDate": "2025-10-15T...",
  "client": {
    "id": "client_123",
    "fullName": "Cliente Premium Ltd",
    "user": {
      "email": "cliente@premium.com"
    }
  },
  "assignees": [
    {
      "id": "assignment_id",
      "employeeId": "employee_id",
      "assignedAt": "2025-09-15T...",
      "assignedBy": "admin_user_id",
      "employee": {
        "id": "employee_id",
        "name": "João Silva",
        "position": "Desenvolvedor Frontend",
        "user": {
          "email": "joao@empresa.com"
        }
      }
    }
  ],
  "tasks": [
    {
      "id": "task_789",
      "title": "Website E-commerce - Cliente Premium",
      "status": "BACKLOG",
      "priority": "ALTA",
      "progress": 0,
      "dueDate": "2025-10-15T...",
      "assignees": []
    }
  ],
  "serviceRequest": {
    "id": "sr_123",
    "projectName": "Website E-commerce",
    "description": "Website completo com carrinho de compras",
    "status": "APPROVED"
  }
}
```

---

## Task Management in Campaigns

### **3. Criar Task na Campanha**
**POST** `/campaigns/:id/tasks`

**Permissões**: `WRITE_TASKS`
**Roles**: `ADMIN`, `EMPLOYEE`

Permite que employees atribuídos à campanha criem novas tasks.

#### Request Body:
```json
{
  "title": "Implementar carrinho de compras",
  "description": "Desenvolver funcionalidade completa do carrinho com cálculo de frete",
  "status": "BACKLOG",
  "priority": "ALTA",
  "dueDate": "2025-09-25T18:00:00.000Z",
  "estimatedHours": 16,
  "assigneeIds": ["employee_id_1", "employee_id_2"]
}
```

#### Validações:
- `title`: string obrigatória
- `description`: string opcional
- `status`: enum `TaskStatus` opcional (padrão: BACKLOG)
- `priority`: enum `TaskPriority` opcional
- `dueDate`: data ISO string opcional
- `estimatedHours`: number opcional
- `assigneeIds`: array de UUIDs de employees opcional

#### Response (201 Created):
```json
{
  "message": "Task created successfully",
  "task": {
    "id": "task_new_123",
    "title": "Implementar carrinho de compras",
    "description": "Desenvolver funcionalidade completa do carrinho com cálculo de frete",
    "status": "BACKLOG",
    "priority": "ALTA",
    "progress": 0,
    "estimatedHours": 16,
    "spentHours": 0,
    "dueDate": "2025-09-25T18:00:00.000Z",
    "campaignId": "campaign_456",
    "clientId": "client_123",
    "serviceId": "service_123",
    "assignees": [
      {
        "id": "assignment_id",
        "employeeId": "employee_id_1",
        "assignedAt": "2025-09-15T...",
        "employee": {
          "id": "employee_id_1",
          "name": "Maria Santos",
          "position": "Desenvolvedor Backend",
          "user": {
            "email": "maria@empresa.com"
          }
        }
      }
    ],
    "campaign": {
      "id": "campaign_456",
      "name": "Website E-commerce - Cliente Premium",
      "status": "ACTIVE"
    },
    "service": {
      "id": "service_123",
      "name": "ecommerce-website",
      "displayName": "Website E-commerce",
      "credits": 150
    }
  }
}
```

---

### **4. Listar Tasks da Campanha**
**GET** `/campaigns/:id/tasks`

**Permissões**: `READ_TASKS`
**Roles**: `ADMIN`, `EMPLOYEE`

Lista todas as tasks de uma campanha específica.

#### Response (200 OK):
```json
{
  "campaign": {
    "id": "campaign_456",
    "name": "Website E-commerce - Cliente Premium",
    "status": "ACTIVE"
  },
  "tasks": [
    {
      "id": "task_789",
      "title": "Website E-commerce - Cliente Premium",
      "description": "Task inicial da campanha",
      "status": "BACKLOG",
      "priority": "ALTA",
      "progress": 0,
      "estimatedHours": 40,
      "spentHours": 0,
      "dueDate": "2025-10-15T...",
      "completedAt": null,
      "createdAt": "2025-09-15T...",
      "assignees": [],
      "service": {
        "id": "service_123",
        "name": "ecommerce-website",
        "displayName": "Website E-commerce",
        "credits": 150
      },
      "files": [],
      "comments": []
    }
  ],
  "totalTasks": 1,
  "tasksByStatus": {
    "backlog": 1,
    "inProgress": 0,
    "completed": 0,
    "archived": 0
  }
}
```

---

### **5. Atualizar Status da Task**
**PATCH** `/campaigns/:campaignId/tasks/:taskId/status`

**Permissões**: `WRITE_TASKS`
**Roles**: `ADMIN`, `EMPLOYEE`

Atualiza o status e progresso de uma task. Apenas employees atribuídos à task ou à campanha podem atualizar.

#### Request Body:
```json
{
  "status": "ANDAMENTO",
  "progress": 25,
  "spentHours": 8,
  "notes": "Iniciado desenvolvimento da estrutura básica"
}
```

#### Validações:
- `status`: enum `TaskStatus` obrigatório
- `progress`: number entre 0-100 opcional
- `spentHours`: number >= 0 opcional
- `notes`: string opcional (cria comentário automático)

#### Response (200 OK):
```json
{
  "message": "Task status updated successfully",
  "task": {
    "id": "task_789",
    "title": "Website E-commerce - Cliente Premium",
    "status": "ANDAMENTO",
    "priority": "ALTA",
    "progress": 25,
    "spentHours": 8,
    "dueDate": "2025-10-15T...",
    "completedAt": null,
    "updatedAt": "2025-09-15T...",
    "assignees": [],
    "campaign": {
      "id": "campaign_456",
      "name": "Website E-commerce - Cliente Premium",
      "status": "ACTIVE"
    },
    "service": {
      "id": "service_123",
      "name": "ecommerce-website",
      "displayName": "Website E-commerce",
      "credits": 150
    }
  }
}
```

---

## File Management

### **6. Upload de Arquivos para Task**
**POST** `/campaigns/:campaignId/tasks/:taskId/files`

**Permissões**: `WRITE_TASKS`
**Roles**: `ADMIN`, `EMPLOYEE`

Faz upload de arquivos para uma task específica da campanha.

#### Request:
- **Content-Type**: `multipart/form-data`
- **Files**: Campo `files` (máximo 10 arquivos, 100MB cada)
- **Body**: `description` (opcional)

#### Response (200 OK):
```json
{
  "message": "Files uploaded successfully",
  "filesCount": 2,
  "files": [
    {
      "id": "file_123",
      "fileName": "wireframe-homepage.png",
      "fileUrl": "/uploads/campaign-task-files/abc123.png",
      "fileType": "DELIVERABLE",
      "description": "Wireframe da página inicial",
      "uploadedAt": "2025-09-15T...",
      "uploadedBy": "user_id"
    },
    {
      "id": "file_124",
      "fileName": "especificacoes.pdf",
      "fileUrl": "/uploads/campaign-task-files/def456.pdf",
      "fileType": "DELIVERABLE",
      "description": "Especificações técnicas",
      "uploadedAt": "2025-09-15T...",
      "uploadedBy": "user_id"
    }
  ]
}
```

---

### **7. Listar Arquivos da Task**
**GET** `/campaigns/:campaignId/tasks/:taskId/files`

**Permissões**: `READ_TASKS`
**Roles**: `ADMIN`, `EMPLOYEE`

Lista todos os arquivos de uma task específica.

#### Response (200 OK):
```json
{
  "task": {
    "id": "task_789",
    "title": "Website E-commerce - Cliente Premium"
  },
  "files": [
    {
      "id": "file_123",
      "fileName": "wireframe-homepage.png",
      "fileUrl": "/uploads/campaign-task-files/abc123.png",
      "fileType": "DELIVERABLE",
      "description": "Wireframe da página inicial",
      "uploadedAt": "2025-09-15T...",
      "uploadedBy": "user_id"
    }
  ],
  "totalFiles": 1,
  "totalSize": 1
}
```

---

### **8. Deletar Arquivo da Task**
**DELETE** `/campaigns/:campaignId/tasks/:taskId/files/:fileId`

**Permissões**: `WRITE_TASKS`
**Roles**: `ADMIN`, `EMPLOYEE`

Remove um arquivo específico de uma task.

#### Response (200 OK):
```json
{
  "message": "File deleted successfully",
  "deletedFile": {
    "id": "file_123",
    "fileName": "wireframe-homepage.png"
  }
}
```

---

## Employee Assignment to Campaigns

### **9. Atribuir Employees à Campanha**
**POST** `/campaigns/:id/assign-employees`

**Permissões**: `WRITE_CAMPAIGNS`
**Roles**: `ADMIN`, `EMPLOYEE`

Atribui employees à campanha (implementa atribuição bidirecional - employees são automaticamente atribuídos às tasks da campanha).

#### Request Body:
```json
{
  "employeeIds": ["employee_id_1", "employee_id_2"],
  "notes": "Atribuição para desenvolvimento urgente"
}
```

#### Response (200 OK):
```json
{
  "message": "Employees assigned to campaign and its tasks successfully",
  "campaign": {
    "id": "campaign_456",
    "name": "Website E-commerce - Cliente Premium",
    "assignees": [
      {
        "id": "assignment_id_1",
        "employeeId": "employee_id_1",
        "assignedAt": "2025-09-15T...",
        "assignedBy": "admin_user_id",
        "employee": {
          "id": "employee_id_1",
          "name": "João Silva",
          "position": "Desenvolvedor Frontend",
          "user": {
            "email": "joao@empresa.com"
          }
        }
      }
    ],
    "tasks": [
      {
        "id": "task_789",
        "assignees": [
          {
            "id": "task_assignment_id",
            "employeeId": "employee_id_1",
            "assignedAt": "2025-09-15T...",
            "employee": {
              "id": "employee_id_1",
              "name": "João Silva",
              "position": "Desenvolvedor Frontend"
            }
          }
        ]
      }
    ]
  },
  "assignedEmployees": [
    {
      "id": "employee_id_1",
      "name": "João Silva",
      "position": "Desenvolvedor Frontend",
      "email": "joao@empresa.com"
    }
  ]
}
```

---

### **10. Remover Employees da Campanha**
**DELETE** `/campaigns/:id/employees`

**Permissões**: `WRITE_CAMPAIGNS`
**Roles**: `ADMIN`, `EMPLOYEE`

Remove employees da campanha (implementa remoção bidirecional - employees são automaticamente removidos das tasks da campanha).

#### Request Body:
```json
{
  "employeeIds": ["employee_id_1", "employee_id_2"]
}
```

#### Response (200 OK):
```json
{
  "message": "Employees removed from campaign and its tasks successfully"
}
```

---

## Error Handling

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
  "message": "You are not assigned to this campaign",
  "error": "Forbidden",
  "statusCode": 403
}
```

### 404 Not Found
```json
{
  "message": "Campaign not found",
  "error": "Not Found",
  "statusCode": 404
}
```

---

## Status e Enum Values

### TaskStatus:
- `BACKLOG` - Tarefa na fila
- `ANDAMENTO` - Em progresso
- `REVISAO` - Em revisão
- `CONCLUIDO` - Finalizada
- `ATRASADO` - Fora do prazo
- `ARQUIVADO` - Arquivada

### TaskPriority:
- `BAIXA` - Prioridade baixa
- `MEDIA` - Prioridade média
- `ALTA` - Prioridade alta
- `URGENTE` - Prioridade urgente

### TaskFileType:
- `INSPIRATION` - Arquivo de inspiração (cliente)
- `DELIVERABLE` - Arquivo entregável (funcionário)

---

## Casos de Uso

### 1. **Fluxo Completo: Service Request → Campaign → Tasks**
1. Cliente cria service request via `POST /service-requests`
2. Admin aprova via `POST /service-requests/:id/approve`
3. Sistema cria automaticamente campanha e task inicial
4. Admin atribui employees via `POST /campaigns/:id/assign-employees`
5. Employees trabalham na campanha:
   - Criam subtasks via `POST /campaigns/:id/tasks`
   - Atualizam status via `PATCH /campaigns/:campaignId/tasks/:taskId/status`
   - Fazem upload de arquivos via `POST /campaigns/:campaignId/tasks/:taskId/files`

### 2. **Employee visualizando suas campanhas**
- Employee acessa `GET /campaigns/my-campaigns` para ver todas as campanhas atribuídas
- Seleciona uma campanha específica via `GET /campaigns/:id`
- Visualiza tarefas via `GET /campaigns/:id/tasks`

### 3. **Colaboração em Task**
- Employee cria nova task via `POST /campaigns/:id/tasks`
- Atribui outros employees à task
- Colaboradores fazem upload de arquivos e atualizam progresso
- Status da task é atualizado conforme progresso

---

## Permissões Necessárias

Para usar esses endpoints, os employees precisam das seguintes permissões:

- `READ_CAMPAIGNS` - Visualizar campanhas
- `WRITE_CAMPAIGNS` - Atribuir/remover employees de campanhas
- `READ_TASKS` - Visualizar tasks das campanhas
- `WRITE_TASKS` - Criar, editar tasks e fazer upload de arquivos

---

## Notes Importantes

1. **Debito Automático**: Créditos são debitados automaticamente quando service request é aprovado
2. **Atribuição Bidirecional**: Employees atribuídos à campanha são automaticamente atribuídos a todas as tasks da campanha
3. **Validação de Permissões**: Apenas employees atribuídos à campanha podem criar/editar tasks
4. **File Upload**: Arquivos são categorizados automaticamente como `DELIVERABLE` para uploads de employees
5. **Comentários Automáticos**: Atualizações de status com notas criam comentários automáticos na task

---

## Additional Endpoints for Document Management and Comments

### **11. Listar Todos os Documentos da Campanha**
**GET** `/campaigns/:id/documents`

**Permissões**: `READ_CAMPAIGNS`
**Roles**: `ADMIN`, `EMPLOYEE`, `CLIENT`

Lista todos os documentos de todas as tasks vinculadas a uma campanha.

#### Response (200 OK):
```json
{
  "campaign": {
    "id": "campaign_456",
    "name": "Website E-commerce - Cliente Premium",
    "status": "ACTIVE"
  },
  "allFiles": [
    {
      "id": "file_123",
      "fileName": "wireframe-homepage.png",
      "fileUrl": "/uploads/campaign-task-files/abc123.png",
      "fileType": "DELIVERABLE",
      "description": "Wireframe da página inicial",
      "uploadedAt": "2025-09-15T...",
      "uploadedBy": "user_id",
      "taskId": "task_789",
      "taskTitle": "Desenvolvimento Frontend"
    }
  ],
  "filesByTask": {
    "task_789": {
      "taskId": "task_789",
      "taskTitle": "Desenvolvimento Frontend",
      "taskStatus": "ANDAMENTO",
      "files": [...],
      "filesCount": 1
    }
  },
  "totalFiles": 1,
  "totalTasks": 1
}
```

---

### **12. Detalhes Completos de uma Task**
**GET** `/campaigns/:campaignId/tasks/:taskId/details`

**Permissões**: `READ_TASKS`
**Roles**: `ADMIN`, `EMPLOYEE`, `CLIENT`

Obtém detalhes completos de uma task incluindo arquivos, comentários e estatísticas.

#### Response (200 OK):
```json
{
  "task": {
    "id": "task_789",
    "title": "Desenvolvimento Frontend",
    "description": "Desenvolver interface do usuário",
    "status": "ANDAMENTO",
    "priority": "ALTA",
    "progress": 45,
    "estimatedHours": 40,
    "spentHours": 18,
    "dueDate": "2025-10-15T...",
    "createdAt": "2025-09-15T...",
    "assignees": [
      {
        "id": "assignment_id",
        "employeeId": "employee_id_1",
        "assignedAt": "2025-09-15T...",
        "employee": {
          "id": "employee_id_1",
          "name": "João Silva",
          "position": "Desenvolvedor Frontend",
          "user": {
            "email": "joao@empresa.com"
          }
        }
      }
    ],
    "files": [
      {
        "id": "file_123",
        "fileName": "wireframe-homepage.png",
        "fileUrl": "/uploads/campaign-task-files/abc123.png",
        "fileType": "DELIVERABLE",
        "description": "Wireframe da página inicial",
        "uploadedAt": "2025-09-15T...",
        "uploadedBy": "user_id"
      }
    ],
    "comments": [
      {
        "id": "comment_123",
        "content": "Progresso excelente! Continue assim.",
        "createdAt": "2025-09-15T...",
        "author": {
          "id": "user_id",
          "email": "admin@empresa.com",
          "role": "ADMIN",
          "employee": {
            "name": "Admin User"
          }
        }
      }
    ],
    "campaign": {
      "id": "campaign_456",
      "name": "Website E-commerce - Cliente Premium",
      "status": "ACTIVE"
    },
    "service": {
      "id": "service_123",
      "name": "ecommerce-website",
      "displayName": "Website E-commerce",
      "credits": 150
    }
  },
  "statistics": {
    "filesCount": 1,
    "commentsCount": 1,
    "assigneesCount": 1
  }
}
```

---

## Task Comments Management

### **13. Criar Comentário em Task**
**POST** `/campaigns/:campaignId/tasks/:taskId/comments`

**Permissões**: `WRITE_TASKS`
**Roles**: `ADMIN`, `EMPLOYEE`, `CLIENT`

Cria um novo comentário em uma task específica.

#### Request Body:
```json
{
  "content": "Ótimo progresso! Gostei muito do layout proposto."
}
```

#### Response (201 Created):
```json
{
  "message": "Comment created successfully",
  "comment": {
    "id": "comment_456",
    "content": "Ótimo progresso! Gostei muito do layout proposto.",
    "createdAt": "2025-09-15T...",
    "updatedAt": "2025-09-15T...",
    "author": {
      "id": "user_id",
      "email": "cliente@premium.com",
      "role": "CLIENT",
      "client": {
        "fullName": "Cliente Premium Ltd"
      }
    }
  }
}
```

---

### **14. Listar Comentários da Task**
**GET** `/campaigns/:campaignId/tasks/:taskId/comments`

**Permissões**: `READ_TASKS`
**Roles**: `ADMIN`, `EMPLOYEE`, `CLIENT`

Lista todos os comentários de uma task com paginação.

#### Query Parameters:
- `page`: Número da página (padrão: 1)
- `limit`: Itens por página (padrão: 20)

#### Response (200 OK):
```json
{
  "task": {
    "id": "task_789",
    "title": "Desenvolvimento Frontend"
  },
  "comments": [
    {
      "id": "comment_456",
      "content": "Ótimo progresso! Gostei muito do layout proposto.",
      "createdAt": "2025-09-15T...",
      "updatedAt": "2025-09-15T...",
      "author": {
        "id": "user_id",
        "email": "cliente@premium.com",
        "role": "CLIENT",
        "client": {
          "fullName": "Cliente Premium Ltd"
        }
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "pages": 1
  }
}
```

---

### **15. Deletar Comentário da Task**
**DELETE** `/campaigns/:campaignId/tasks/:taskId/comments/:commentId`

**Permissões**: `WRITE_TASKS`
**Roles**: `ADMIN`, `EMPLOYEE`, `CLIENT`

Remove um comentário de uma task. Apenas o autor do comentário pode deletá-lo.

#### Response (200 OK):
```json
{
  "message": "Comment deleted successfully"
}
```

---

## Campaign Comments Management

### **16. Criar Comentário em Campanha**
**POST** `/campaigns/:id/comments`

**Permissões**: `WRITE_CAMPAIGNS`
**Roles**: `ADMIN`, `EMPLOYEE`, `CLIENT`

Cria um comentário geral na campanha.

#### Request Body:
```json
{
  "content": "Campanha está evoluindo muito bem. Parabéns a toda a equipe!"
}
```

#### Response (201 Created):
```json
{
  "message": "Comment created successfully",
  "comment": {
    "id": "campaign_comment_123",
    "content": "Campanha está evoluindo muito bem. Parabéns a toda a equipe!",
    "createdAt": "2025-09-15T...",
    "updatedAt": "2025-09-15T...",
    "author": {
      "id": "user_id",
      "email": "cliente@premium.com",
      "role": "CLIENT",
      "client": {
        "fullName": "Cliente Premium Ltd"
      }
    }
  }
}
```

---

### **17. Listar Comentários da Campanha**
**GET** `/campaigns/:id/comments`

**Permissões**: `READ_CAMPAIGNS`
**Roles**: `ADMIN`, `EMPLOYEE`, `CLIENT`

Lista comentários gerais da campanha com paginação.

#### Query Parameters:
- `page`: Número da página (padrão: 1)
- `limit`: Itens por página (padrão: 20)

#### Response (200 OK):
```json
{
  "campaign": {
    "id": "campaign_456",
    "name": "Website E-commerce - Cliente Premium"
  },
  "comments": [
    {
      "id": "campaign_comment_123",
      "content": "Campanha está evoluindo muito bem. Parabéns a toda a equipe!",
      "createdAt": "2025-09-15T...",
      "updatedAt": "2025-09-15T...",
      "author": {
        "id": "user_id",
        "email": "cliente@premium.com",
        "role": "CLIENT",
        "client": {
          "fullName": "Cliente Premium Ltd"
        }
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "pages": 1
  }
}
```

---

### **18. Deletar Comentário da Campanha**
**DELETE** `/campaigns/:id/comments/:commentId`

**Permissões**: `WRITE_CAMPAIGNS`
**Roles**: `ADMIN`, `EMPLOYEE`, `CLIENT`

Remove um comentário da campanha. Apenas o autor do comentário pode deletá-lo.

#### Response (200 OK):
```json
{
  "message": "Comment deleted successfully"
}
```

---

## Casos de Uso Avançados

### 1. **Cliente Acompanhando Progresso**
1. Cliente acessa `GET /campaigns/:id` para ver status geral da campanha
2. Visualiza documentos via `GET /campaigns/:id/documents`
3. Comenta sobre o progresso via `POST /campaigns/:id/comments`
4. Revisa tasks específicas via `GET /campaigns/:campaignId/tasks/:taskId/details`

### 2. **Employee Colaborando em Task**
1. Employee acessa `GET /campaigns/:campaignId/tasks/:taskId/details` para ver task completa
2. Faz upload de arquivo via `POST /campaigns/:campaignId/tasks/:taskId/files`
3. Atualiza progresso via `PATCH /campaigns/:campaignId/tasks/:taskId/status`
4. Adiciona comentário via `POST /campaigns/:campaignId/tasks/:taskId/comments`

### 3. **Admin Supervisionando Campanha**
1. Admin visualiza todos os documentos via `GET /campaigns/:id/documents`
2. Acompanha comentários via `GET /campaigns/:id/comments`
3. Supervisiona tasks individuais via `GET /campaigns/:campaignId/tasks/:taskId/details`
4. Adiciona feedback via `POST /campaigns/:id/comments`

---

## Validações e Regras de Negócio

### **Comentários:**
- Apenas o autor pode deletar seus próprios comentários
- Comentários são ordenados por data de criação (mais recentes primeiro)
- Suporte a paginação para performance

### **Documentos:**
- Arquivos são organizados por task para facilitar navegação
- Lista geral mostra todos os arquivos da campanha ordenados por data
- Estatísticas incluem contagem total de arquivos e tasks

### **Permissões:**
- `READ_CAMPAIGNS` e `READ_TASKS` para visualizar
- `WRITE_CAMPAIGNS` e `WRITE_TASKS` para comentar e fazer upload
- Clientes podem comentar em suas próprias campanhas
- Employees podem comentar apenas em campanhas atribuídas

---

### **19. Visão Geral Admin - Todas as Campanhas**
**GET** `/campaigns/admin/overview`

**Permissões**: `READ_CAMPAIGNS`
**Roles**: `ADMIN`

Endpoint exclusivo para admins visualizarem todas as campanhas com estatísticas detalhadas e métricas de performance.

#### Query Parameters:
- `page`: Número da página (padrão: 1)
- `limit`: Itens por página (padrão: 20)
- `status`: Filtro por status da campanha
- `clientId`: Filtro por cliente específico
- `search`: Busca por nome ou descrição

#### Response (200 OK):
```json
{
  "campaigns": [
    {
      "id": "campaign_456",
      "name": "Website E-commerce - Cliente Premium",
      "description": "Desenvolvimento de website e-commerce completo",
      "status": "ACTIVE",
      "startDate": "2025-09-15T...",
      "endDate": "2025-10-15T...",
      "client": {
        "id": "client_123",
        "fullName": "Cliente Premium Ltd",
        "companyName": "Premium Company",
        "user": {
          "email": "cliente@premium.com"
        }
      },
      "tasks": [
        {
          "id": "task_789",
          "title": "Desenvolvimento Frontend",
          "status": "ANDAMENTO",
          "priority": "ALTA",
          "progress": 45,
          "estimatedHours": 40,
          "spentHours": 18,
          "dueDate": "2025-10-15T...",
          "assignees": [
            {
              "employee": {
                "name": "João Silva",
                "position": "Desenvolvedor Frontend"
              }
            }
          ]
        }
      ],
      "assignees": [
        {
          "employee": {
            "id": "employee_id_1",
            "name": "João Silva",
            "position": "Desenvolvedor Frontend",
            "user": {
              "email": "joao@empresa.com"
            }
          },
          "assignedAt": "2025-09-15T..."
        }
      ],
      "statistics": {
        "totalTasks": 1,
        "completedTasks": 0,
        "tasksInProgress": 1,
        "tasksBacklog": 0,
        "totalEstimatedHours": 40,
        "totalSpentHours": 18,
        "avgProgress": 45,
        "totalFiles": 3,
        "totalComments": 2,
        "efficiency": 2.22,
        "daysActive": 5,
        "avgTaskCompletionTime": null,
        "teamUtilization": 45
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "pages": 1
  },
  "globalStatistics": {
    "totalCampaigns": 1,
    "activeCampaigns": 1,
    "completedCampaigns": 0,
    "totalTasks": 1,
    "completedTasks": 0,
    "globalAvgProgress": 45,
    "totalEstimatedHours": 40,
    "totalSpentHours": 18,
    "globalEfficiency": 2.22,
    "totalFiles": 3,
    "totalComments": 2,
    "totalEmployees": 1,
    "totalClients": 1,
    "campaignsByStatus": {
      "ACTIVE": 1,
      "COMPLETED": 0,
      "PAUSED": 0,
      "CANCELLED": 0
    },
    "tasksByStatus": {
      "BACKLOG": 0,
      "ANDAMENTO": 1,
      "REVISAO": 0,
      "CONCLUIDO": 0,
      "ATRASADO": 0,
      "ARQUIVADO": 0
    },
    "tasksByPriority": {
      "BAIXA": 0,
      "MEDIA": 0,
      "ALTA": 1,
      "URGENTE": 0
    },
    "topPerformingEmployees": [
      {
        "employeeId": "employee_id_1",
        "name": "João Silva",
        "tasksCompleted": 0,
        "avgProgress": 45,
        "totalSpentHours": 18
      }
    ],
    "mostActiveCampaigns": [
      {
        "campaignId": "campaign_456",
        "name": "Website E-commerce - Cliente Premium",
        "totalActivity": 5,
        "totalFiles": 3,
        "totalComments": 2
      }
    ],
    "clientActivity": [
      {
        "clientId": "client_123",
        "fullName": "Cliente Premium Ltd",
        "activeCampaigns": 1,
        "totalTasks": 1,
        "avgProgress": 45
      }
    ]
  }
}
```

#### Métricas Explicadas:

**Estatísticas por Campanha:**
- `efficiency`: Relação entre horas estimadas e horas gastas (estimatedHours / spentHours)
- `daysActive`: Número de dias desde a criação da campanha
- `avgTaskCompletionTime`: Tempo médio para completar tasks (em dias)
- `teamUtilization`: Progresso médio das tasks da campanha

**Estatísticas Globais:**
- `globalEfficiency`: Eficiência média de todas as campanhas
- `topPerformingEmployees`: Top 5 employees por tasks completadas e progresso
- `mostActiveCampaigns`: Top 5 campanhas por atividade (arquivos + comentários)
- `clientActivity`: Atividade de todos os clientes

#### Casos de Uso:
1. **Dashboard Admin**: Visão geral completa de todas as campanhas ativas
2. **Relatórios de Performance**: Métricas de eficiência e produtividade da equipe
3. **Monitoramento de Clientes**: Acompanhar atividade e progresso por cliente
4. **Gestão de Recursos**: Identificar gargalos e distribuição de carga de trabalho

---

## Client Campaign Access

### **20. Visualizar Minhas Campanhas (Cliente)**
**GET** `/campaigns/client`

**Permissões**: `READ_CAMPAIGNS`  
**Roles**: `CLIENT`

Este endpoint permite que clientes visualizem todas as campanhas vinculadas a eles com informações detalhadas sobre progresso, tasks, arquivos e comentários recentes.

#### ✨ **Características Especiais para Clientes:**
- 🔒 **Acesso Seguro**: Apenas campanhas do próprio cliente
- 📊 **Dados Agregados**: Totais de horas, créditos e progresso
- 📁 **Arquivos**: Lista dos arquivos mais recentes das tasks
- 💬 **Comentários**: Comentários recentes para acompanhamento
- 📈 **Progresso**: Percentual de conclusão calculado automaticamente

#### Query Parameters:
- `page` (number, opcional): Número da página (padrão: 1)
- `limit` (number, opcional): Itens por página (padrão: 20, máx: 100)
- `status` (string, opcional): Filtro por status (`ACTIVE`, `COMPLETED`, `PAUSED`, `CANCELLED`)
- `search` (string, opcional): Busca por nome ou descrição da campanha
- `sortBy` (string, opcional): Campo para ordenação (padrão: `createdAt`)
- `sortOrder` (string, opcional): Ordem (`asc` ou `desc`, padrão: `desc`)

#### Response (200 OK):
```json
{
  "campaigns": [
    {
      "id": "campaign_456",
      "name": "Website E-commerce - Cliente Premium",
      "description": "Desenvolvimento de website e-commerce completo com todas as funcionalidades",
      "status": "ACTIVE",
      "startDate": "2025-09-15T10:00:00.000Z",
      "endDate": "2025-10-15T18:00:00.000Z",
      "createdAt": "2025-09-15T10:00:00.000Z",
      "assignees": [
        {
          "id": "assignment_123",
          "assignedAt": "2025-09-15T10:30:00.000Z",
          "employee": {
            "id": "emp_789",
            "name": "João Silva",
            "position": "Desenvolvedor Frontend",
            "user": {
              "email": "joao@empresa.com"
            }
          }
        },
        {
          "id": "assignment_124", 
          "assignedAt": "2025-09-15T10:30:00.000Z",
          "employee": {
            "id": "emp_790",
            "name": "Maria Santos",
            "position": "Designer UX/UI",
            "user": {
              "email": "maria@empresa.com"
            }
          }
        }
      ],
      "tasks": [
        {
          "id": "task_789",
          "title": "Desenvolvimento Frontend",
          "status": "ANDAMENTO", 
          "priority": "ALTA",
          "progress": 45,
          "estimatedHours": 40,
          "spentHours": 18,
          "dueDate": "2025-10-15T18:00:00.000Z",
          "completedAt": null,
          "createdAt": "2025-09-15T10:00:00.000Z",
          "service": {
            "id": "service_123",
            "name": "website-development",
            "displayName": "Desenvolvimento de Website",
            "credits": 150
          }
        }
      ],
      "serviceRequest": {
        "id": "sr_456",
        "projectName": "Website E-commerce",
        "description": "Desenvolvimento completo do website",
        "status": "APPROVED",
        "creditsCost": 150
      },
      "files": [
        {
          "id": "file_123",
          "fileName": "wireframe-homepage.pdf",
          "fileUrl": "/uploads/campaign-task-files/wireframe-homepage.pdf",
          "fileType": "application/pdf",
          "description": "Wireframe da página inicial",
          "uploadedAt": "2025-09-16T14:30:00.000Z",
          "taskId": "task_789"
        }
      ],
      "comments": [
        {
          "id": "comment_123",
          "content": "Primeira versão do wireframe está pronta para revisão",
          "createdAt": "2025-09-16T15:00:00.000Z",
          "author": {
            "id": "user_789",
            "email": "joao@empresa.com",
            "role": "EMPLOYEE",
            "employee": {
              "name": "João Silva"
            },
            "client": null
          }
        }
      ],
      "totals": {
        "estimatedHours": 40,
        "spentHours": 18,
        "credits": 150,
        "tasks": 1,
        "completedTasks": 0,
        "progress": 45
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 3,
    "pages": 1
  }
}
```

#### ⚠️ **Validações Automáticas:**
- Cliente só pode ver suas próprias campanhas
- Dados de outros clientes são automaticamente filtrados
- Acesso negado caso não tenha campanhas vinculadas

#### 💡 **Casos de Uso Típicos:**

**1. Dashboard do Cliente:**
```javascript
// Buscar todas as campanhas ativas
GET /campaigns/client?status=ACTIVE&limit=10

// Buscar campanhas por termo
GET /campaigns/client?search=website&page=1
```

**2. Acompanhamento de Progresso:**
```javascript
// Ver campanhas ordenadas por progresso
GET /campaigns/client?sortBy=progress&sortOrder=asc

**3. Monitoramento de Entregas:**
```javascript
// Ver arquivos mais recentes
GET /campaigns/client?limit=5&sortBy=createdAt&sortOrder=desc
```

#### 📋 **Guia de Interpretação dos Dados:**

**Status das Campanhas:**
- `ACTIVE`: Campanha em andamento, com tasks sendo executadas
- `COMPLETED`: Campanha finalizada com sucesso  
- `PAUSED`: Campanha pausada temporariamente
- `CANCELLED`: Campanha cancelada

**Status das Tasks:**
- `BACKLOG`: Task criada, aguardando início
- `ANDAMENTO`: Task em execução pelos employees
- `REVISAO`: Task aguardando revisão/aprovação
- `CONCLUIDO`: Task finalizada

**Prioridades das Tasks:**
- `BAIXA`: Pode ser feita quando houver tempo
- `MEDIA`: Prioridade normal
- `ALTA`: Deve ser feita com urgência
- `URGENTE`: Requer atenção imediata

**Interpretando o Progresso:**
- `progress`: Percentual de conclusão da task individual (0-100)
- `totals.progress`: Percentual geral da campanha baseado em tasks concluídas
- `estimatedHours` vs `spentHours`: Comparação entre tempo estimado e real

#### 🔗 **Endpoints Relacionados para Clientes:**

Após obter a lista de campanhas, você pode usar:

- `GET /campaigns/:id/tasks` - Ver todas as tasks de uma campanha específica
- `GET /campaigns/:id/comments` - Ver comentários da campanha  
- `POST /campaigns/:id/comments` - Adicionar comentários na campanha
- `GET /campaigns/:campaignId/tasks/:taskId/files` - Ver arquivos de uma task
- `POST /campaigns/:campaignId/tasks/:taskId/comments` - Comentar em uma task específica

#### 🚀 **Exemplo Prático de Uso:**

```javascript
// Frontend/JavaScript - Buscar campanhas do cliente autenticado
const token = localStorage.getItem('authToken');

async function getMyCampaigns() {
  try {
    const response = await fetch('/api/campaigns/client?page=1&limit=10&status=ACTIVE', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('Minhas campanhas:', data.campaigns);
      console.log('Total de campanhas:', data.pagination.total);
      
      // Processar cada campanha
      data.campaigns.forEach(campaign => {
        console.log(`Campanha: ${campaign.name}`);
        console.log(`Progresso: ${campaign.totals.progress}%`);
        console.log(`Tasks concluídas: ${campaign.totals.completedTasks}/${campaign.totals.tasks}`);
      });
    }
  } catch (error) {
    console.error('Erro ao buscar campanhas:', error);
  }
}

// Buscar campanhas com filtro de busca
async function searchCampaigns(searchTerm) {
  const response = await fetch(`/api/campaigns/client?search=${encodeURIComponent(searchTerm)}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  return response.json();
}
```

#### ✅ **Resumo do Endpoint:**

O endpoint `GET /campaigns/client` é a **porta de entrada principal** para clientes acompanharem seus projetos. Ele fornece:

✨ **Visão Geral Completa**: Todas as campanhas do cliente com progresso detalhado  
📊 **Métricas Agregadas**: Horas, créditos, progresso e estatísticas  
👥 **Equipe Atribuída**: Informações dos employees trabalhando no projeto  
📁 **Arquivos Recentes**: Últimas entregas e documentos  
💬 **Comunicação**: Comentários e atualizações da equipe  
🔍 **Busca e Filtros**: Encontrar campanhas específicas rapidamente  
📱 **Paginação**: Performance otimizada para grandes volumes  

---
        {
          "id": "task_789",
          "title": "Desenvolvimento Frontend",
          "status": "ANDAMENTO",
          "priority": "ALTA",
          "progress": 45,
          "estimatedHours": 40,
          "spentHours": 18,
          "dueDate": "2025-10-15T..."
        }
      ],
      "totals": {
        "estimatedHours": 40,
        "spentHours": 18,
        "credits": 150,
        "tasks": 1,
        "completedTasks": 0,
        "progress": 45
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "pages": 1
  }
}
```

---

### **21. Visualizar Tasks da Campanha (Cliente)**
**GET** `/campaigns/:id/tasks`

**Permissões**: `READ_TASKS`
**Roles**: `ADMIN`, `EMPLOYEE`, `CLIENT`

Clientes podem visualizar as tasks de suas próprias campanhas. Inclui validação de propriedade.

#### Response (200 OK):
```json
{
  "campaign": {
    "id": "campaign_456",
    "name": "Website E-commerce - Cliente Premium",
    "status": "ACTIVE"
  },
  "tasks": [
    {
      "id": "task_789",
      "title": "Desenvolvimento Frontend",
      "description": "Desenvolver interface do usuário",
      "status": "ANDAMENTO",
      "priority": "ALTA",
      "progress": 45,
      "estimatedHours": 40,
      "spentHours": 18,
      "dueDate": "2025-10-15T...",
      "assignees": [
        {
          "employee": {
            "name": "João Silva",
            "position": "Desenvolvedor Frontend"
          }
        }
      ],
      "files": [],
      "comments": []
    }
  ],
  "totalTasks": 1,
  "tasksByStatus": {
    "backlog": 0,
    "inProgress": 1,
    "completed": 0,
    "archived": 0
  }
}
```

---

### **22. Visualizar Arquivos da Task (Cliente)**
**GET** `/campaigns/:campaignId/tasks/:taskId/files`

**Permissões**: `READ_TASKS`
**Roles**: `ADMIN`, `EMPLOYEE`, `CLIENT`

Clientes podem visualizar arquivos das tasks de suas próprias campanhas.

#### Response (200 OK):
```json
{
  "task": {
    "id": "task_789",
    "title": "Desenvolvimento Frontend"
  },
  "files": [
    {
      "id": "file_123",
      "fileName": "wireframe-homepage.png",
      "fileUrl": "/uploads/campaign-task-files/abc123.png",
      "fileType": "DELIVERABLE",
      "description": "Wireframe da página inicial",
      "uploadedAt": "2025-09-15T...",
      "uploadedBy": "employee_user_id"
    },
    {
      "id": "file_124",
      "fileName": "prototipo-final.figma",
      "fileUrl": "/uploads/campaign-task-files/def456.figma",
      "fileType": "DELIVERABLE",
      "description": "Protótipo finalizado",
      "uploadedAt": "2025-09-16T...",
      "uploadedBy": "employee_user_id"
    }
  ],
  "totalFiles": 2,
  "totalSize": 2
}
```

---

## Client Interaction Features

### **Recursos Disponíveis para Clientes:**

1. **Visualização Completa de Campanhas**
   - Listar todas suas campanhas
   - Ver detalhes específicos de cada campanha
   - Acompanhar progresso em tempo real

2. **Acompanhamento de Tasks**
   - Visualizar todas as tasks de suas campanhas
   - Ver progresso, status e prazos
   - Identificar responsáveis por cada task

3. **Acesso a Documentos**
   - Visualizar todos os arquivos das campanhas
   - Ver detalhes completos de cada task
   - Acessar entregas e documentos dos employees

4. **Sistema de Comentários**
   - Comentar em campanhas e tasks específicas
   - Fornecer feedback para a equipe
   - Acompanhar comunicações do projeto

### **Restrições de Segurança:**

- **Isolamento de Dados**: Clientes só podem acessar suas próprias campanhas
- **Validação de Propriedade**: Verificação automática em todos os endpoints
- **Permissões Controladas**: Acesso apenas para leitura e comentários
- **Dados Sensíveis**: Informações de outros clientes são protegidas

### **Casos de Uso do Cliente:**

#### 1. **Acompanhamento de Projeto**
```
1. Cliente acessa GET /campaigns/client para ver suas campanhas
2. Seleciona uma campanha específica
3. Visualiza tasks via GET /campaigns/:id/tasks
4. Acompanha arquivos via GET /campaigns/:campaignId/tasks/:taskId/files
5. Adiciona comentários para feedback
```

#### 2. **Revisão de Entregas**
```
1. Cliente acessa GET /campaigns/:id/documents para ver todos os arquivos
2. Baixa documentos e entregas
3. Comenta sobre o progresso via POST /campaigns/:id/comments
4. Solicita ajustes via POST /campaigns/:campaignId/tasks/:taskId/comments
```

#### 3. **Monitoramento de Prazos**
```
1. Cliente verifica status das tasks
2. Identifica tasks atrasadas ou em progresso
3. Comunica urgências via sistema de comentários
4. Acompanha resolução em tempo real
```

---

Esta implementação garante um fluxo completo desde a aprovação do service request até a execução colaborativa das campanhas pelos employees, com visibilidade total para administradores e transparência completa para clientes.
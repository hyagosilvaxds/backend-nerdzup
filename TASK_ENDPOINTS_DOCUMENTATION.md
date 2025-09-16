# Documentação dos Endpoints de Tasks

Esta documentação descreve os endpoints para gerenciamento e listagem de tasks do sistema.

## Índice
- [1. Employee - Minhas Tasks](#1-employee---minhas-tasks)
- [2. Admin - Todas as Tasks do Sistema](#2-admin---todas-as-tasks-do-sistema)
- [3. Cliente - Minhas Tasks](#3-cliente---minhas-tasks)
- [4. Admin/Employee - Tasks de Cliente Específico](#4-adminemployee---tasks-de-cliente-específico)
- [Parâmetros de Query Disponíveis](#parâmetros-de-query-disponíveis)

---

## 1. Employee - Minhas Tasks

### Endpoint
```
GET /campaigns/tasks/my-tasks
```

### Autorização
- **Roles:** EMPLOYEE
- **Permissões:** READ_TASKS
- **Headers:** `Authorization: Bearer <JWT_TOKEN>`

### Parâmetros de Query
Todos os parâmetros são opcionais:

| Parâmetro | Tipo | Padrão | Descrição |
|-----------|------|--------|-----------|
| `campaignId` | string | - | ID da campanha para filtrar |
| `status` | enum | - | Status da task (BACKLOG, ANDAMENTO, CONCLUIDO, ARQUIVADO) |
| `includeArchived` | boolean | false | Incluir tasks arquivadas |
| `search` | string | - | Busca por título ou descrição |
| `startDate` | string (ISO) | - | Data inicial (filtro por criação) |
| `endDate` | string (ISO) | - | Data final (filtro por criação) |
| `page` | number | 1 | Número da página |
| `limit` | number | 10 | Itens por página |
| `sortBy` | string | createdAt | Campo para ordenação |
| `sortOrder` | enum | desc | Ordem (asc/desc) |

### Exemplo de Request
```http
GET /campaigns/tasks/my-tasks?campaignId=123e4567-e89b-12d3-a456-426614174000&status=ANDAMENTO&page=1&limit=5
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Response Success (200)
```json
{
  "tasks": [
    {
      "id": "task-123e4567-e89b-12d3-a456-426614174000",
      "title": "Criar landing page",
      "description": "Desenvolver página inicial do site",
      "status": "ANDAMENTO",
      "priority": "HIGH",
      "progress": 75,
      "estimatedHours": 40,
      "spentHours": 30,
      "dueDate": "2024-02-15T23:59:59.000Z",
      "completedAt": null,
      "createdAt": "2024-01-15T10:00:00.000Z",
      "updatedAt": "2024-01-20T14:30:00.000Z",
      "campaignId": "123e4567-e89b-12d3-a456-426614174000",
      "clientId": "client-123e4567-e89b-12d3-a456-426614174000",
      "serviceId": "service-123e4567-e89b-12d3-a456-426614174000",
      "campaign": {
        "id": "123e4567-e89b-12d3-a456-426614174000",
        "name": "Campanha Marketing Digital",
        "status": "ACTIVE",
        "client": {
          "id": "client-123e4567-e89b-12d3-a456-426614174000",
          "fullName": "João Silva",
          "companyName": "Empresa ABC Ltda"
        }
      },
      "assignees": [
        {
          "id": "assignee-123e4567-e89b-12d3-a456-426614174000",
          "taskId": "task-123e4567-e89b-12d3-a456-426614174000",
          "employeeId": "emp-123e4567-e89b-12d3-a456-426614174000",
          "assignedBy": "user-123e4567-e89b-12d3-a456-426614174000",
          "assignedAt": "2024-01-15T10:00:00.000Z",
          "employee": {
            "id": "emp-123e4567-e89b-12d3-a456-426614174000",
            "name": "Maria Santos",
            "position": "Desenvolvedora Frontend"
          }
        }
      ],
      "service": {
        "id": "service-123e4567-e89b-12d3-a456-426614174000",
        "name": "website-development",
        "displayName": "Desenvolvimento de Website"
      },
      "files": [
        {
          "id": "file-123e4567-e89b-12d3-a456-426614174000",
          "fileName": "mockup-v1.pdf",
          "uploadedAt": "2024-01-18T09:15:00.000Z"
        }
      ],
      "comments": [
        {
          "id": "comment-123e4567-e89b-12d3-a456-426614174000",
          "createdAt": "2024-01-19T16:30:00.000Z"
        }
      ]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 5,
    "total": 15,
    "pages": 3
  },
  "summary": {
    "total": 15,
    "byStatus": {
      "backlog": 3,
      "inProgress": 5,
      "inReview": 2,
      "completed": 6,
      "overdue": 1,
      "archived": 1
    }
  }
}
```

---

## 2. Admin - Todas as Tasks do Sistema

### Endpoint
```
GET /campaigns/tasks/admin/all
```

### Autorização
- **Roles:** ADMIN
- **Permissões:** READ_TASKS
- **Headers:** `Authorization: Bearer <JWT_TOKEN>`

### Parâmetros de Query
Mesmos parâmetros do endpoint anterior.

### Exemplo de Request
```http
GET /campaigns/tasks/admin/all?search=website&includeArchived=true&limit=20
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Response Success (200)
```json
{
  "tasks": [
    {
      "id": "task-123e4567-e89b-12d3-a456-426614174000",
      "title": "Desenvolver website responsivo",
      "description": "Criar site com design responsivo para todos os dispositivos",
      "status": "CONCLUIDO",
      "priority": "HIGH",
      "progress": 100,
      "estimatedHours": 80,
      "spentHours": 85,
      "dueDate": "2024-01-31T23:59:59.000Z",
      "completedAt": "2024-01-30T18:45:00.000Z",
      "createdAt": "2024-01-01T09:00:00.000Z",
      "updatedAt": "2024-01-30T18:45:00.000Z",
      "campaignId": "123e4567-e89b-12d3-a456-426614174000",
      "clientId": "client-123e4567-e89b-12d3-a456-426614174000",
      "serviceId": "service-123e4567-e89b-12d3-a456-426614174000",
      "campaign": {
        "id": "123e4567-e89b-12d3-a456-426614174000",
        "name": "Projeto Website Empresa XYZ",
        "status": "ACTIVE",
        "client": {
          "id": "client-123e4567-e89b-12d3-a456-426614174000",
          "fullName": "Ana Costa",
          "companyName": "XYZ Tecnologia",
          "user": {
            "email": "ana@xyztecnologia.com",
            "isActive": true
          }
        }
      },
      "assignees": [
        {
          "id": "assignee-123e4567-e89b-12d3-a456-426614174000",
          "taskId": "task-123e4567-e89b-12d3-a456-426614174000",
          "employeeId": "emp-123e4567-e89b-12d3-a456-426614174000",
          "assignedBy": "user-admin-123e4567-e89b-12d3-a456-426614174000",
          "assignedAt": "2024-01-01T09:00:00.000Z",
          "employee": {
            "id": "emp-123e4567-e89b-12d3-a456-426614174000",
            "name": "Carlos Oliveira",
            "position": "Desenvolvedor Fullstack",
            "department": "Desenvolvimento",
            "user": {
              "email": "carlos@empresa.com",
              "isActive": true
            }
          }
        }
      ],
      "service": {
        "id": "service-123e4567-e89b-12d3-a456-426614174000",
        "name": "website-development",
        "displayName": "Desenvolvimento de Website",
        "credits": 500
      },
      "files": [
        {
          "id": "file-123e4567-e89b-12d3-a456-426614174000",
          "fileName": "website-final.zip",
          "fileType": "DELIVERABLE",
          "uploadedAt": "2024-01-30T17:30:00.000Z"
        }
      ],
      "comments": [
        {
          "id": "comment-123e4567-e89b-12d3-a456-426614174000",
          "createdAt": "2024-01-30T18:00:00.000Z",
          "author": {
            "id": "user-123e4567-e89b-12d3-a456-426614174000",
            "role": "EMPLOYEE"
          }
        }
      ]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8
  },
  "stats": {
    "total": 150,
    "byStatus": {
      "backlog": 25,
      "inProgress": 45,
      "inReview": 15,
      "completed": 70,
      "overdue": 8,
      "archived": 10
    },
    "totalFiles": 180,
    "totalComments": 340,
    "uniqueCampaigns": 35,
    "uniqueEmployees": 12
  }
}
```

---

## 3. Cliente - Minhas Tasks

### Endpoint
```
GET /campaigns/tasks/client
```

### Autorização
- **Roles:** CLIENT
- **Permissões:** READ_TASKS
- **Headers:** `Authorization: Bearer <JWT_TOKEN>`

### Parâmetros de Query
Mesmos parâmetros dos endpoints anteriores.

### Exemplo de Request
```http
GET /campaigns/tasks/client?status=CONCLUIDO&sortBy=completedAt&sortOrder=desc&limit=10
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Response Success (200)
```json
{
  "tasks": [
    {
      "id": "task-123e4567-e89b-12d3-a456-426614174000",
      "title": "Design do logotipo",
      "description": "Criação de logotipo personalizado para a empresa",
      "status": "CONCLUIDO",
      "priority": "MEDIUM",
      "progress": 100,
      "estimatedHours": 20,
      "spentHours": 18,
      "dueDate": "2024-01-20T23:59:59.000Z",
      "completedAt": "2024-01-19T16:30:00.000Z",
      "createdAt": "2024-01-10T14:00:00.000Z",
      "updatedAt": "2024-01-19T16:30:00.000Z",
      "campaignId": "123e4567-e89b-12d3-a456-426614174000",
      "clientId": "client-123e4567-e89b-12d3-a456-426614174000",
      "serviceId": "service-design-123e4567-e89b-12d3-a456-426614174000",
      "campaign": {
        "id": "123e4567-e89b-12d3-a456-426614174000",
        "name": "Identidade Visual Completa",
        "status": "ACTIVE"
      },
      "assignees": [
        {
          "id": "assignee-123e4567-e89b-12d3-a456-426614174000",
          "taskId": "task-123e4567-e89b-12d3-a456-426614174000",
          "employeeId": "emp-design-123e4567-e89b-12d3-a456-426614174000",
          "assignedBy": "user-admin-123e4567-e89b-12d3-a456-426614174000",
          "assignedAt": "2024-01-10T14:00:00.000Z",
          "employee": {
            "id": "emp-design-123e4567-e89b-12d3-a456-426614174000",
            "name": "Isabella Designer",
            "position": "Designer Gráfico"
          }
        }
      ],
      "service": {
        "id": "service-design-123e4567-e89b-12d3-a456-426614174000",
        "name": "graphic-design",
        "displayName": "Design Gráfico"
      },
      "files": [
        {
          "id": "file-logo-123e4567-e89b-12d3-a456-426614174000",
          "fileName": "logo-final-versions.zip",
          "fileType": "DELIVERABLE",
          "uploadedAt": "2024-01-19T16:15:00.000Z"
        }
      ],
      "comments": [
        {
          "id": "comment-approval-123e4567-e89b-12d3-a456-426614174000",
          "createdAt": "2024-01-19T16:25:00.000Z"
        }
      ]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3
  },
  "summary": {
    "total": 25,
    "byStatus": {
      "backlog": 2,
      "inProgress": 8,
      "inReview": 3,
      "completed": 14,
      "overdue": 1,
      "archived": 1
    },
    "byCampaign": {
      "123e4567-e89b-12d3-a456-426614174000": {
        "campaignName": "Identidade Visual Completa",
        "count": 15
      },
      "456e7890-e89b-12d3-a456-426614174000": {
        "campaignName": "Website Institucional",
        "count": 10
      }
    }
  }
}
```

---

## 4. Admin/Employee - Tasks de Cliente Específico

### Endpoint
```
GET /campaigns/tasks/client/:clientId
```

### Autorização
- **Roles:** ADMIN, EMPLOYEE
- **Permissões:** READ_TASKS
- **Headers:** `Authorization: Bearer <JWT_TOKEN>`

### Parâmetros de Path
| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `clientId` | string | Sim | ID do cliente |

### Parâmetros de Query
Mesmos parâmetros dos endpoints anteriores.

### Exemplo de Request
```http
GET /campaigns/tasks/client/client-123e4567-e89b-12d3-a456-426614174000?includeArchived=true&page=1&limit=15
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Response Success (200)
```json
{
  "tasks": [
    {
      "id": "task-789e0123-e89b-12d3-a456-426614174000",
      "title": "Configuração de SEO",
      "description": "Otimização de SEO para melhor rankeamento nos buscadores",
      "status": "ANDAMENTO",
      "priority": "HIGH",
      "progress": 60,
      "estimatedHours": 25,
      "spentHours": 15,
      "dueDate": "2024-02-10T23:59:59.000Z",
      "completedAt": null,
      "createdAt": "2024-01-25T11:00:00.000Z",
      "updatedAt": "2024-01-28T09:30:00.000Z",
      "campaignId": "789e0123-e89b-12d3-a456-426614174000",
      "clientId": "client-123e4567-e89b-12d3-a456-426614174000",
      "serviceId": "service-seo-123e4567-e89b-12d3-a456-426614174000",
      "campaign": {
        "id": "789e0123-e89b-12d3-a456-426614174000",
        "name": "Marketing Digital 360°",
        "status": "ACTIVE"
      },
      "assignees": [
        {
          "id": "assignee-seo-123e4567-e89b-12d3-a456-426614174000",
          "taskId": "task-789e0123-e89b-12d3-a456-426614174000",
          "employeeId": "emp-seo-123e4567-e89b-12d3-a456-426614174000",
          "assignedBy": "user-admin-123e4567-e89b-12d3-a456-426614174000",
          "assignedAt": "2024-01-25T11:00:00.000Z",
          "employee": {
            "id": "emp-seo-123e4567-e89b-12d3-a456-426614174000",
            "name": "Pedro SEO Specialist",
            "position": "Especialista em SEO"
          }
        }
      ],
      "service": {
        "id": "service-seo-123e4567-e89b-12d3-a456-426614174000",
        "name": "seo-optimization",
        "displayName": "Otimização de SEO"
      },
      "files": [
        {
          "id": "file-seo-report-123e4567-e89b-12d3-a456-426614174000",
          "fileName": "seo-analysis-report.pdf",
          "fileType": "DELIVERABLE",
          "uploadedAt": "2024-01-27T14:20:00.000Z"
        }
      ],
      "comments": [
        {
          "id": "comment-progress-123e4567-e89b-12d3-a456-426614174000",
          "createdAt": "2024-01-28T09:15:00.000Z"
        }
      ]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 15,
    "total": 18,
    "pages": 2
  },
  "summary": {
    "total": 18,
    "byStatus": {
      "backlog": 3,
      "inProgress": 6,
      "inReview": 2,
      "completed": 8,
      "overdue": 1,
      "archived": 1
    },
    "byCampaign": {
      "789e0123-e89b-12d3-a456-426614174000": {
        "campaignName": "Marketing Digital 360°",
        "count": 12
      },
      "abc1234-e89b-12d3-a456-426614174000": {
        "campaignName": "E-commerce Setup",
        "count": 6
      }
    }
  }
}
```

---

## Parâmetros de Query Disponíveis

### Filtros de Busca
| Parâmetro | Tipo | Descrição | Exemplo |
|-----------|------|-----------|---------|
| `campaignId` | string | Filtrar tasks por campanha específica | `?campaignId=123e4567-e89b-12d3-a456-426614174000` |
| `status` | enum | Filtrar por status da task | `?status=ANDAMENTO` |
| `search` | string | Busca por título, descrição ou nome da campanha | `?search=website` |
| `startDate` | string (ISO) | Data inicial para filtro por data de criação | `?startDate=2024-01-01T00:00:00.000Z` |
| `endDate` | string (ISO) | Data final para filtro por data de criação | `?endDate=2024-01-31T23:59:59.000Z` |
| `includeArchived` | boolean | Incluir tasks arquivadas na resposta | `?includeArchived=true` |

### Paginação e Ordenação
| Parâmetro | Tipo | Padrão | Descrição | Exemplo |
|-----------|------|--------|-----------|---------|
| `page` | number | 1 | Número da página | `?page=2` |
| `limit` | number | 10 | Quantidade de itens por página | `?limit=25` |
| `sortBy` | string | createdAt | Campo para ordenação | `?sortBy=dueDate` |
| `sortOrder` | enum | desc | Ordem da ordenação (asc/desc) | `?sortOrder=asc` |

### Valores Válidos para Enums

#### Status da Task
- `BACKLOG`: Task em backlog
- `ANDAMENTO`: Task em andamento
- `REVISAO`: Task em revisão
- `CONCLUIDO`: Task concluída
- `ATRASADO`: Task atrasada
- `ARQUIVADO`: Task arquivada

#### Prioridades
- `LOW`: Baixa prioridade
- `MEDIUM`: Média prioridade
- `HIGH`: Alta prioridade
- `URGENT`: Urgente

#### Campos de Ordenação Válidos
- `createdAt`: Data de criação
- `updatedAt`: Data de atualização
- `dueDate`: Data de vencimento
- `completedAt`: Data de conclusão
- `title`: Título da task
- `priority`: Prioridade
- `progress`: Progresso (%)

---

## Códigos de Erro

### 400 - Bad Request
```json
{
  "message": "Employee profile not found",
  "error": "Bad Request",
  "statusCode": 400
}
```

### 401 - Unauthorized
```json
{
  "message": "Unauthorized",
  "statusCode": 401
}
```

### 403 - Forbidden
```json
{
  "message": "Forbidden resource",
  "error": "Forbidden",
  "statusCode": 403
}
```

### 404 - Not Found
```json
{
  "message": "Client not found",
  "error": "Not Found",
  "statusCode": 404
}
```

---

## Notas Importantes

1. **Autenticação:** Todos os endpoints requerem token JWT válido no header `Authorization`
2. **Permissões:** Cada endpoint valida as permissões específicas do usuário
3. **Paginação:** Por padrão, retorna 10 itens por página
4. **Filtros:** Tasks arquivadas são excluídas por padrão (usar `includeArchived=true` para incluir)
5. **Ordenação:** Por padrão, ordena por data de criação em ordem decrescente
6. **Busca:** O parâmetro `search` busca em título, descrição e nome da campanha (case-insensitive)
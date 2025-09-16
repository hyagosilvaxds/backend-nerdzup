# Documentação dos Endpoints de Gerenciamento de Tasks

Esta documentação descreve os endpoints para gerenciamento individual de tasks, incluindo visualização detalhada, atualização de status, upload de arquivos e gerenciamento de comentários.

## Índice
- [1. Obter Detalhes de uma Task](#1-obter-detalhes-de-uma-task)
- [2. Atualizar Status da Task](#2-atualizar-status-da-task)
- [3. Upload de Arquivos](#3-upload-de-arquivos)
- [4. Gerenciar Arquivos](#4-gerenciar-arquivos)
- [5. Gerenciar Comentários](#5-gerenciar-comentários)

---

## 1. Obter Detalhes de uma Task

### Endpoint
```
GET /campaigns/:campaignId/tasks/:taskId/details
```

### Autorização
- **Roles:** ADMIN, EMPLOYEE, CLIENT
- **Permissões:** READ_TASKS
- **Headers:** `Authorization: Bearer <JWT_TOKEN>`

### Parâmetros de Path
| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `campaignId` | string | Sim | ID da campanha |
| `taskId` | string | Sim | ID da task |

### Exemplo de Request
```http
GET /campaigns/123e4567-e89b-12d3-a456-426614174000/tasks/task-789e0123-e89b-12d3-a456-426614174000/details
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Response Success (200)
```json
{
  "task": {
    "id": "task-789e0123-e89b-12d3-a456-426614174000",
    "title": "Desenvolvimento da Landing Page",
    "description": "Criar uma landing page responsiva para a campanha de marketing digital com foco em conversão",
    "status": "ANDAMENTO",
    "priority": "HIGH",
    "progress": 75,
    "estimatedHours": 40,
    "spentHours": 30,
    "dueDate": "2024-02-15T23:59:59.000Z",
    "completedAt": null,
    "createdAt": "2024-01-15T10:00:00.000Z",
    "updatedAt": "2024-01-28T14:30:00.000Z",
    "campaignId": "123e4567-e89b-12d3-a456-426614174000",
    "clientId": "client-123e4567-e89b-12d3-a456-426614174000",
    "serviceId": "service-123e4567-e89b-12d3-a456-426614174000",
    "assignees": [
      {
        "id": "assignee-123e4567-e89b-12d3-a456-426614174000",
        "taskId": "task-789e0123-e89b-12d3-a456-426614174000",
        "employeeId": "emp-123e4567-e89b-12d3-a456-426614174000",
        "assignedBy": "user-admin-123e4567-e89b-12d3-a456-426614174000",
        "assignedAt": "2024-01-15T10:00:00.000Z",
        "employee": {
          "id": "emp-123e4567-e89b-12d3-a456-426614174000",
          "name": "Maria Silva",
          "position": "Desenvolvedora Frontend",
          "user": {
            "email": "maria.silva@empresa.com"
          }
        }
      }
    ],
    "files": [
      {
        "id": "file-123e4567-e89b-12d3-a456-426614174000",
        "fileName": "wireframe-landing-page.pdf",
        "fileUrl": "https://storage.company.com/tasks/wireframe-landing-page.pdf",
        "fileType": "REFERENCE",
        "description": "Wireframe inicial da landing page",
        "uploadedAt": "2024-01-20T09:15:00.000Z",
        "uploadedBy": "user-123e4567-e89b-12d3-a456-426614174000"
      },
      {
        "id": "file-456e7890-e89b-12d3-a456-426614174000",
        "fileName": "landing-page-v1.zip",
        "fileUrl": "https://storage.company.com/tasks/landing-page-v1.zip",
        "fileType": "DELIVERABLE",
        "description": "Primeira versão da landing page",
        "uploadedAt": "2024-01-28T14:20:00.000Z",
        "uploadedBy": "user-emp-123e4567-e89b-12d3-a456-426614174000"
      }
    ],
    "comments": [
      {
        "id": "comment-123e4567-e89b-12d3-a456-426614174000",
        "content": "Primeira versão da landing page concluída. Implementei as funcionalidades principais conforme solicitado.",
        "createdAt": "2024-01-28T14:25:00.000Z",
        "updatedAt": "2024-01-28T14:25:00.000Z",
        "taskId": "task-789e0123-e89b-12d3-a456-426614174000",
        "authorId": "user-emp-123e4567-e89b-12d3-a456-426614174000",
        "author": {
          "id": "user-emp-123e4567-e89b-12d3-a456-426614174000",
          "email": "maria.silva@empresa.com",
          "role": "EMPLOYEE",
          "employee": {
            "name": "Maria Silva"
          },
          "client": null
        }
      },
      {
        "id": "comment-456e7890-e89b-12d3-a456-426614174000",
        "content": "Excelente trabalho! Podemos adicionar um formulário de contato na seção inferior?",
        "createdAt": "2024-01-28T15:10:00.000Z",
        "updatedAt": "2024-01-28T15:10:00.000Z",
        "taskId": "task-789e0123-e89b-12d3-a456-426614174000",
        "authorId": "user-client-123e4567-e89b-12d3-a456-426614174000",
        "author": {
          "id": "user-client-123e4567-e89b-12d3-a456-426614174000",
          "email": "joao@cliente.com",
          "role": "CLIENT",
          "employee": null,
          "client": {
            "fullName": "João Santos"
          }
        }
      }
    ],
    "campaign": {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "Marketing Digital - Lançamento Produto",
      "status": "ACTIVE"
    },
    "service": {
      "id": "service-123e4567-e89b-12d3-a456-426614174000",
      "name": "web-development",
      "displayName": "Desenvolvimento Web",
      "credits": 500
    }
  },
  "statistics": {
    "filesCount": 2,
    "commentsCount": 2,
    "assigneesCount": 1
  }
}
```

---

## 2. Atualizar Status da Task

### Endpoint
```
PATCH /campaigns/:campaignId/tasks/:taskId/status
```

### Autorização
- **Roles:** ADMIN, EMPLOYEE
- **Permissões:** WRITE_TASKS
- **Headers:** `Authorization: Bearer <JWT_TOKEN>`

### Parâmetros de Path
| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `campaignId` | string | Sim | ID da campanha |
| `taskId` | string | Sim | ID da task |

### Body Parameters
```json
{
  "status": "CONCLUIDO",
  "progress": 100,
  "spentHours": 35,
  "notes": "Task finalizada conforme especificações. Todos os requisitos foram atendidos."
}
```

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `status` | enum | Sim | Novo status (BACKLOG, ANDAMENTO, REVISAO, CONCLUIDO, ATRASADO, ARQUIVADO) |
| `progress` | number | Não | Progresso da task (0-100) |
| `spentHours` | number | Não | Horas gastas na task |
| `notes` | string | Não | Observações sobre a atualização |

### Exemplo de Request
```http
PATCH /campaigns/123e4567-e89b-12d3-a456-426614174000/tasks/task-789e0123-e89b-12d3-a456-426614174000/status
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "status": "CONCLUIDO",
  "progress": 100,
  "spentHours": 38,
  "notes": "Landing page finalizada com todas as funcionalidades solicitadas. Testes realizados em diferentes dispositivos."
}
```

### Response Success (200)
```json
{
  "message": "Task status updated successfully",
  "task": {
    "id": "task-789e0123-e89b-12d3-a456-426614174000",
    "title": "Desenvolvimento da Landing Page",
    "description": "Criar uma landing page responsiva para a campanha de marketing digital com foco em conversão",
    "status": "CONCLUIDO",
    "priority": "HIGH",
    "progress": 100,
    "estimatedHours": 40,
    "spentHours": 38,
    "dueDate": "2024-02-15T23:59:59.000Z",
    "completedAt": "2024-01-29T16:45:00.000Z",
    "createdAt": "2024-01-15T10:00:00.000Z",
    "updatedAt": "2024-01-29T16:45:00.000Z",
    "campaignId": "123e4567-e89b-12d3-a456-426614174000",
    "clientId": "client-123e4567-e89b-12d3-a456-426614174000",
    "serviceId": "service-123e4567-e89b-12d3-a456-426614174000",
    "assignees": [
      {
        "id": "assignee-123e4567-e89b-12d3-a456-426614174000",
        "taskId": "task-789e0123-e89b-12d3-a456-426614174000",
        "employeeId": "emp-123e4567-e89b-12d3-a456-426614174000",
        "assignedBy": "user-admin-123e4567-e89b-12d3-a456-426614174000",
        "assignedAt": "2024-01-15T10:00:00.000Z",
        "employee": {
          "id": "emp-123e4567-e89b-12d3-a456-426614174000",
          "name": "Maria Silva",
          "position": "Desenvolvedora Frontend",
          "user": {
            "email": "maria.silva@empresa.com"
          }
        }
      }
    ],
    "campaign": {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "Marketing Digital - Lançamento Produto",
      "status": "ACTIVE"
    },
    "service": {
      "id": "service-123e4567-e89b-12d3-a456-426614174000",
      "name": "web-development",
      "displayName": "Desenvolvimento Web",
      "credits": 500
    }
  }
}
```

---

## 3. Upload de Arquivos

### Endpoint
```
POST /campaigns/:campaignId/tasks/:taskId/files
```

### Autorização
- **Roles:** ADMIN, EMPLOYEE
- **Permissões:** WRITE_TASKS
- **Headers:** `Authorization: Bearer <JWT_TOKEN>`

### Parâmetros de Path
| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `campaignId` | string | Sim | ID da campanha |
| `taskId` | string | Sim | ID da task |

### Form Data
| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `files` | File[] | Sim | Arquivos para upload (máximo 10, 100MB cada) |
| `description` | string | Não | Descrição dos arquivos |

### Exemplo de Request
```http
POST /campaigns/123e4567-e89b-12d3-a456-426614174000/tasks/task-789e0123-e89b-12d3-a456-426614174000/files
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: multipart/form-data

--boundary123
Content-Disposition: form-data; name="files"; filename="landing-page-final.zip"
Content-Type: application/zip

[binary data]
--boundary123
Content-Disposition: form-data; name="files"; filename="documentation.pdf"
Content-Type: application/pdf

[binary data]
--boundary123
Content-Disposition: form-data; name="description"

Versão final da landing page com documentação técnica
--boundary123--
```

### Response Success (200)
```json
{
  "message": "Files uploaded successfully",
  "filesCount": 2,
  "files": [
    {
      "id": "file-new-123e4567-e89b-12d3-a456-426614174000",
      "fileName": "landing-page-final.zip",
      "fileUrl": "https://storage.company.com/tasks/landing-page-final.zip",
      "fileType": "DELIVERABLE",
      "description": "Versão final da landing page com documentação técnica",
      "uploadedAt": "2024-01-29T17:00:00.000Z",
      "uploadedBy": "user-emp-123e4567-e89b-12d3-a456-426614174000",
      "taskId": "task-789e0123-e89b-12d3-a456-426614174000"
    },
    {
      "id": "file-new-456e7890-e89b-12d3-a456-426614174000",
      "fileName": "documentation.pdf",
      "fileUrl": "https://storage.company.com/tasks/documentation.pdf",
      "fileType": "DELIVERABLE",
      "description": "Versão final da landing page com documentação técnica",
      "uploadedAt": "2024-01-29T17:00:00.000Z",
      "uploadedBy": "user-emp-123e4567-e89b-12d3-a456-426614174000",
      "taskId": "task-789e0123-e89b-12d3-a456-426614174000"
    }
  ]
}
```

---

## 4. Gerenciar Arquivos

### 4.1. Listar Arquivos da Task

#### Endpoint
```
GET /campaigns/:campaignId/tasks/:taskId/files
```

#### Autorização
- **Roles:** ADMIN, EMPLOYEE, CLIENT
- **Permissões:** READ_TASKS
- **Headers:** `Authorization: Bearer <JWT_TOKEN>`

#### Exemplo de Request
```http
GET /campaigns/123e4567-e89b-12d3-a456-426614174000/tasks/task-789e0123-e89b-12d3-a456-426614174000/files
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Response Success (200)
```json
{
  "task": {
    "id": "task-789e0123-e89b-12d3-a456-426614174000",
    "title": "Desenvolvimento da Landing Page"
  },
  "files": [
    {
      "id": "file-123e4567-e89b-12d3-a456-426614174000",
      "fileName": "wireframe-landing-page.pdf",
      "fileUrl": "https://storage.company.com/tasks/wireframe-landing-page.pdf",
      "fileType": "REFERENCE",
      "description": "Wireframe inicial da landing page",
      "uploadedAt": "2024-01-20T09:15:00.000Z",
      "uploadedBy": "user-123e4567-e89b-12d3-a456-426614174000",
      "taskId": "task-789e0123-e89b-12d3-a456-426614174000"
    },
    {
      "id": "file-new-123e4567-e89b-12d3-a456-426614174000",
      "fileName": "landing-page-final.zip",
      "fileUrl": "https://storage.company.com/tasks/landing-page-final.zip",
      "fileType": "DELIVERABLE",
      "description": "Versão final da landing page com documentação técnica",
      "uploadedAt": "2024-01-29T17:00:00.000Z",
      "uploadedBy": "user-emp-123e4567-e89b-12d3-a456-426614174000",
      "taskId": "task-789e0123-e89b-12d3-a456-426614174000"
    }
  ],
  "totalFiles": 2,
  "totalSize": 2
}
```

### 4.2. Deletar Arquivo

#### Endpoint
```
DELETE /campaigns/:campaignId/tasks/:taskId/files/:fileId
```

#### Autorização
- **Roles:** ADMIN, EMPLOYEE
- **Permissões:** WRITE_TASKS
- **Headers:** `Authorization: Bearer <JWT_TOKEN>`

#### Parâmetros de Path
| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `campaignId` | string | Sim | ID da campanha |
| `taskId` | string | Sim | ID da task |
| `fileId` | string | Sim | ID do arquivo |

#### Exemplo de Request
```http
DELETE /campaigns/123e4567-e89b-12d3-a456-426614174000/tasks/task-789e0123-e89b-12d3-a456-426614174000/files/file-123e4567-e89b-12d3-a456-426614174000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Response Success (200)
```json
{
  "message": "File deleted successfully",
  "deletedFile": {
    "id": "file-123e4567-e89b-12d3-a456-426614174000",
    "fileName": "wireframe-landing-page.pdf"
  }
}
```

---

## 5. Gerenciar Comentários

### 5.1. Criar Comentário

#### Endpoint
```
POST /campaigns/:campaignId/tasks/:taskId/comments
```

#### Autorização
- **Roles:** ADMIN, EMPLOYEE, CLIENT
- **Permissões:** WRITE_TASKS
- **Headers:** `Authorization: Bearer <JWT_TOKEN>`

#### Body Parameters
```json
{
  "content": "Excelente trabalho na landing page! Ficou conforme esperado. Podemos prosseguir para a próxima fase."
}
```

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `content` | string | Sim | Conteúdo do comentário |

#### Exemplo de Request
```http
POST /campaigns/123e4567-e89b-12d3-a456-426614174000/tasks/task-789e0123-e89b-12d3-a456-426614174000/comments
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "content": "Excelente trabalho na landing page! Ficou conforme esperado. Podemos prosseguir para a próxima fase."
}
```

#### Response Success (201)
```json
{
  "message": "Comment created successfully",
  "comment": {
    "id": "comment-new-123e4567-e89b-12d3-a456-426614174000",
    "content": "Excelente trabalho na landing page! Ficou conforme esperado. Podemos prosseguir para a próxima fase.",
    "createdAt": "2024-01-29T17:30:00.000Z",
    "updatedAt": "2024-01-29T17:30:00.000Z",
    "taskId": "task-789e0123-e89b-12d3-a456-426614174000",
    "authorId": "user-client-123e4567-e89b-12d3-a456-426614174000",
    "author": {
      "id": "user-client-123e4567-e89b-12d3-a456-426614174000",
      "email": "joao@cliente.com",
      "role": "CLIENT",
      "employee": null,
      "client": {
        "fullName": "João Santos"
      }
    }
  }
}
```

### 5.2. Listar Comentários

#### Endpoint
```
GET /campaigns/:campaignId/tasks/:taskId/comments
```

#### Autorização
- **Roles:** ADMIN, EMPLOYEE, CLIENT
- **Permissões:** READ_TASKS
- **Headers:** `Authorization: Bearer <JWT_TOKEN>`

#### Parâmetros de Query
| Parâmetro | Tipo | Padrão | Descrição |
|-----------|------|--------|-----------|
| `page` | number | 1 | Número da página |
| `limit` | number | 20 | Itens por página |

#### Exemplo de Request
```http
GET /campaigns/123e4567-e89b-12d3-a456-426614174000/tasks/task-789e0123-e89b-12d3-a456-426614174000/comments?page=1&limit=10
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Response Success (200)
```json
{
  "task": {
    "id": "task-789e0123-e89b-12d3-a456-426614174000",
    "title": "Desenvolvimento da Landing Page"
  },
  "comments": [
    {
      "id": "comment-new-123e4567-e89b-12d3-a456-426614174000",
      "content": "Excelente trabalho na landing page! Ficou conforme esperado. Podemos prosseguir para a próxima fase.",
      "createdAt": "2024-01-29T17:30:00.000Z",
      "updatedAt": "2024-01-29T17:30:00.000Z",
      "taskId": "task-789e0123-e89b-12d3-a456-426614174000",
      "authorId": "user-client-123e4567-e89b-12d3-a456-426614174000",
      "author": {
        "id": "user-client-123e4567-e89b-12d3-a456-426614174000",
        "email": "joao@cliente.com",
        "role": "CLIENT",
        "employee": null,
        "client": {
          "fullName": "João Santos"
        }
      }
    },
    {
      "id": "comment-456e7890-e89b-12d3-a456-426614174000",
      "content": "Obrigada pelo feedback! Vou preparar a documentação final para entrega.",
      "createdAt": "2024-01-29T17:45:00.000Z",
      "updatedAt": "2024-01-29T17:45:00.000Z",
      "taskId": "task-789e0123-e89b-12d3-a456-426614174000",
      "authorId": "user-emp-123e4567-e89b-12d3-a456-426614174000",
      "author": {
        "id": "user-emp-123e4567-e89b-12d3-a456-426614174000",
        "email": "maria.silva@empresa.com",
        "role": "EMPLOYEE",
        "employee": {
          "name": "Maria Silva"
        },
        "client": null
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 2,
    "pages": 1
  }
}
```

### 5.3. Deletar Comentário

#### Endpoint
```
DELETE /campaigns/:campaignId/tasks/:taskId/comments/:commentId
```

#### Autorização
- **Roles:** ADMIN, EMPLOYEE, CLIENT
- **Permissões:** WRITE_TASKS
- **Headers:** `Authorization: Bearer <JWT_TOKEN>`
- **Restrições:** Apenas o autor do comentário pode deletá-lo

#### Parâmetros de Path
| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `campaignId` | string | Sim | ID da campanha |
| `taskId` | string | Sim | ID da task |
| `commentId` | string | Sim | ID do comentário |

#### Exemplo de Request
```http
DELETE /campaigns/123e4567-e89b-12d3-a456-426614174000/tasks/task-789e0123-e89b-12d3-a456-426614174000/comments/comment-456e7890-e89b-12d3-a456-426614174000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Response Success (200)
```json
{
  "message": "Comment deleted successfully"
}
```

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

```json
{
  "message": "No files provided",
  "error": "Bad Request",
  "statusCode": 400
}
```

```json
{
  "message": "File landing-page.zip is too large. Maximum size is 100MB",
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
  "message": "You are not assigned to this task or campaign",
  "error": "Forbidden",
  "statusCode": 403
}
```

### 404 - Not Found
```json
{
  "message": "Task not found in this campaign",
  "error": "Not Found",
  "statusCode": 404
}
```

```json
{
  "message": "File not found in this campaign task",
  "error": "Not Found",
  "statusCode": 404
}
```

```json
{
  "message": "Comment not found or you are not authorized to delete it",
  "error": "Not Found",
  "statusCode": 404
}
```

---

## Notas Importantes

### Permissões de Acesso
1. **ADMIN:** Acesso completo a todas as tasks e operações
2. **EMPLOYEE:** Acesso apenas às tasks em que está atribuído ou campanhas atribuídas
3. **CLIENT:** Acesso apenas às suas próprias tasks (verificação por clientId)

### Upload de Arquivos
1. **Limite:** Máximo 10 arquivos por upload
2. **Tamanho:** Máximo 100MB por arquivo
3. **Tipos:** Todos os tipos de arquivo são aceitos
4. **Segurança:** Validação de tamanho e sanitização de nomes

### Comentários
1. **Autorização:** Apenas o autor pode deletar seus próprios comentários
2. **Ordenação:** Comentários listados por data decrescente
3. **Paginação:** Padrão de 20 comentários por página

### Status da Task
1. **BACKLOG:** Task em backlog
2. **ANDAMENTO:** Task em andamento
3. **REVISAO:** Task em revisão
4. **CONCLUIDO:** Task concluída
5. **ATRASADO:** Task atrasada
6. **ARQUIVADO:** Task arquivada

### Tipos de Arquivo
1. **REFERENCE:** Arquivos de referência (briefings, wireframes, etc.)
2. **DELIVERABLE:** Entregáveis (código, designs finais, etc.)

### Automatizações
1. **Comentário automático:** Criado quando status é atualizado com `notes`
2. **Data de conclusão:** Automaticamente definida quando status = CONCLUIDO
3. **Validações:** Verificação de atribuição antes de permitir alterações
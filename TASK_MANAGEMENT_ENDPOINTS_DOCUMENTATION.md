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
        "uploadedBy": "user-123e4567-e89b-12d3-a456-426614174000",
        "uploader": {
          "id": "user-123e4567-e89b-12d3-a456-426614174000",
          "email": "joao@cliente.com",
          "profilePhoto": "https://storage.company.com/profiles/joao-photo.jpg",
          "employee": null,
          "client": {
            "fullName": "João Silva"
          }
        }
      },
      {
        "id": "file-456e7890-e89b-12d3-a456-426614174000",
        "fileName": "landing-page-v1.zip",
        "fileUrl": "https://storage.company.com/tasks/landing-page-v1.zip",
        "fileType": "DELIVERABLE",
        "description": "Primeira versão da landing page",
        "uploadedAt": "2024-01-28T14:20:00.000Z",
        "uploadedBy": "user-emp-123e4567-e89b-12d3-a456-426614174000",
        "uploader": {
          "id": "user-emp-123e4567-e89b-12d3-a456-426614174000",
          "email": "maria.silva@empresa.com",
          "profilePhoto": "https://storage.company.com/profiles/maria-photo.jpg",
          "employee": {
            "name": "Maria Silva"
          },
          "client": null
        }
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
      "taskId": "task-789e0123-e89b-12d3-a456-426614174000",
      "uploader": {
        "id": "user-emp-123e4567-e89b-12d3-a456-426614174000",
        "email": "maria.silva@empresa.com",
        "profilePhoto": "https://storage.company.com/profiles/maria-photo.jpg",
        "employee": {
          "name": "Maria Silva"
        },
        "client": null
      }
    },
    {
      "id": "file-new-456e7890-e89b-12d3-a456-426614174000",
      "fileName": "documentation.pdf",
      "fileUrl": "https://storage.company.com/tasks/documentation.pdf",
      "fileType": "DELIVERABLE",
      "description": "Versão final da landing page com documentação técnica",
      "uploadedAt": "2024-01-29T17:00:00.000Z",
      "uploadedBy": "user-emp-123e4567-e89b-12d3-a456-426614174000",
      "taskId": "task-789e0123-e89b-12d3-a456-426614174000",
      "uploader": {
        "id": "user-emp-123e4567-e89b-12d3-a456-426614174000",
        "email": "maria.silva@empresa.com",
        "profilePhoto": "https://storage.company.com/profiles/maria-photo.jpg",
        "employee": {
          "name": "Maria Silva"
        },
        "client": null
      }
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
      "taskId": "task-789e0123-e89b-12d3-a456-426614174000",
      "uploader": {
        "id": "user-123e4567-e89b-12d3-a456-426614174000",
        "email": "joao@cliente.com",
        "profilePhoto": "https://storage.company.com/profiles/joao-photo.jpg",
        "employee": null,
        "client": {
          "fullName": "João Silva"
        }
      }
    },
    {
      "id": "file-new-123e4567-e89b-12d3-a456-426614174000",
      "fileName": "landing-page-final.zip",
      "fileUrl": "https://storage.company.com/tasks/landing-page-final.zip",
      "fileType": "DELIVERABLE",
      "description": "Versão final da landing page com documentação técnica",
      "uploadedAt": "2024-01-29T17:00:00.000Z",
      "uploadedBy": "user-emp-123e4567-e89b-12d3-a456-426614174000",
      "taskId": "task-789e0123-e89b-12d3-a456-426614174000",
      "uploader": {
        "id": "user-emp-123e4567-e89b-12d3-a456-426614174000",
        "email": "maria.silva@empresa.com",
        "profilePhoto": "https://storage.company.com/profiles/maria-photo.jpg",
        "employee": {
          "name": "Maria Silva"
        },
        "client": null
      }
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
    "authorName": "João Santos",
    "authorProfilePhoto": "https://example.com/photos/joao.jpg",
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

---

## 📋 ADVANCED TASK MANAGEMENT ENDPOINTS

### GET /campaigns/tasks/advanced
Endpoint avançado para listagem de todas as tasks com filtros complexos por status da task e status da campanha.

**Acessível por:** ADMIN, EMPLOYEE, CLIENT

**Query Parameters:**
```typescript
{
  // Filtros básicos
  campaignId?: string           // ID específico de uma campanha
  status?: TaskStatus          // Status específico da task
  campaignStatus?: string      // Status da campanha (ACTIVE, COMPLETED, DRAFT, etc.)

  // Opções de inclusão
  includeArchived?: boolean    // Incluir tasks arquivadas (default: false)
  includeFiles?: boolean       // Incluir arquivos das tasks (default: false)
  includeComments?: boolean    // Incluir comentários das tasks (default: false)

  // Filtros de data
  startDate?: string           // Data início (ISO string)
  endDate?: string            // Data fim (ISO string)

  // Busca textual
  search?: string             // Busca por título ou descrição

  // Paginação
  page?: number               // Página (default: 1)
  limit?: number              // Items per page (default: 10)

  // Ordenação
  sortBy?: string             // Campo para ordenação (default: 'createdAt')
  sortOrder?: 'asc' | 'desc'  // Direção da ordenação (default: 'desc')
}
```

**Response:**
```json
{
  "tasks": [
    {
      "id": "task_id",
      "title": "Task Title",
      "description": "Task description",
      "status": "ANDAMENTO",
      "priority": "HIGH",
      "dueDate": "2024-12-31T23:59:59.000Z",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "campaign": {
        "id": "campaign_id",
        "title": "Campaign Title",
        "status": "ACTIVE"
      },
      "assignees": [
        {
          "employee": {
            "id": "employee_id",
            "name": "Employee Name",
            "position": "Developer"
          }
        }
      ],
      "files": [
        {
          "id": "file_id",
          "fileName": "document.pdf",
          "fileUrl": "https://...",
          "uploader": {
            "id": "user_id",
            "email": "user@example.com",
            "employee": { "name": "Uploader Name" }
          }
        }
      ],
      "comments": [
        {
          "id": "comment_id",
          "content": "Comment text",
          "createdAt": "2024-01-01T00:00:00.000Z",
          "authorName": "Employee Name",
          "authorProfilePhoto": "https://example.com/photos/employee.jpg",
          "author": {
            "email": "author@example.com",
            "role": "EMPLOYEE"
          }
        }
      ]
    }
  ],
  "pagination": {
    "total": 25,
    "page": 1,
    "limit": 10,
    "totalPages": 3
  },
  "stats": {
    "total": 25,
    "byStatus": {
      "backlog": 5,
      "inProgress": 8,
      "inReview": 3,
      "completed": 7,
      "overdue": 1,
      "archived": 1
    },
    "byCampaignStatus": {
      "ACTIVE": 20,
      "COMPLETED": 5
    }
  }
}
```

**Comportamento por Role:**
- **ADMIN**: Visualiza todas as tasks do sistema
- **EMPLOYEE**: Visualiza tasks das campanhas em que está atribuído
- **CLIENT**: Visualiza apenas suas próprias tasks

---

### POST /campaigns/{campaignId}/tasks/{taskId}/client-action
Permite que clientes realizem ações nas tasks (aceitar, rejeitar ou comentar).

**Acessível por:** CLIENT

**Path Parameters:**
- `campaignId`: ID da campanha
- `taskId`: ID da task

**Body:**
```typescript
{
  action: "ACCEPT" | "REJECT" | "COMMENT",
  comment?: string,  // Obrigatório para REJECT e COMMENT, opcional para ACCEPT
  reason?: string    // Motivo da rejeição ou observações adicionais
}
```

**Responses:**

**ACCEPT Action:**
```json
{
  "message": "Task aceita e marcada como concluída",
  "action": "ACCEPTED",
  "updatedTask": {
    "id": "task_id",
    "status": "CONCLUIDO",
    "completedAt": "2024-01-01T12:00:00.000Z"
  }
}
```

**REJECT Action:**
```json
{
  "message": "Task rejeitada. Feedback enviado à equipe",
  "action": "REJECTED",
  "updatedTask": {
    "id": "task_id",
    "status": "REVISAO"
  },
  "comment": {
    "id": "comment_id",
    "content": "Task rejeitada: Precisa de ajustes - Motivo: Layout inconsistente",
    "createdAt": "2024-01-01T12:00:00.000Z",
    "authorName": "Cliente Nome",
    "authorProfilePhoto": "https://example.com/photos/client.jpg"
  }
}
```

**COMMENT Action:**
```json
{
  "message": "Comentário adicionado com sucesso",
  "action": "COMMENTED",
  "comment": {
    "id": "comment_id",
    "content": "Gostaria de algumas alterações no design",
    "createdAt": "2024-01-01T12:00:00.000Z",
    "authorName": "Cliente Nome",
    "authorProfilePhoto": "https://example.com/photos/client.jpg",
    "author": {
      "email": "client@example.com",
      "role": "CLIENT",
      "client": {
        "fullName": "Cliente Nome"
      }
    }
  }
}
```

**Validações:**
- Task deve pertencer ao cliente autenticado
- Task deve ter status diferente de `CONCLUIDO` ou `ARQUIVADO`
- Para ação `REJECT` e `COMMENT`, o campo `comment` é obrigatório
- Cliente deve estar ativo e ter permissões adequadas

**Comportamentos Especiais:**
- **ACCEPT**: Muda status da task para `CONCLUIDO` e define `completedAt`
- **REJECT**: Muda status da task para `REVISAO` e adiciona comentário automático
- **COMMENT**: Apenas adiciona comentário sem alterar status da task

---

## 🔧 EXEMPLOS DE USO AVANÇADOS

### 1. Buscar todas as tasks em andamento de campanhas ativas
```bash
GET /campaigns/tasks/advanced?status=ANDAMENTO&campaignStatus=ACTIVE&includeFiles=true
```

### 2. Buscar tasks atrasadas com comentários
```bash
GET /campaigns/tasks/advanced?status=ATRASADO&includeComments=true&sortBy=dueDate&sortOrder=asc
```

### 3. Cliente aceitar uma task
```bash
POST /campaigns/camp_123/tasks/task_456/client-action
Content-Type: application/json

{
  "action": "ACCEPT",
  "comment": "Perfeito! Aprovado."
}
```

### 4. Cliente rejeitar uma task
```bash
POST /campaigns/camp_123/tasks/task_456/client-action
Content-Type: application/json

{
  "action": "REJECT",
  "comment": "Precisa de ajustes no layout",
  "reason": "Cores não estão de acordo com a identidade visual"
}
```

### 5. Buscar tasks de um período específico
```bash
GET /campaigns/tasks/advanced?startDate=2024-01-01T00:00:00.000Z&endDate=2024-01-31T23:59:59.000Z&includeFiles=true&includeComments=true
```

### 6. Buscar tasks de uma campanha específica para cliente
```bash
GET /campaigns/tasks/advanced?campaignId=camp_123&includeFiles=true&includeComments=true&limit=20
```

---

## ⚡ PERFORMANCE E LIMITAÇÕES

- **Paginação**: Máximo 50 items por página
- **Busca textual**: Indexação nos campos `title` e `description`
- **Filtros de data**: Aplicados no campo `createdAt` das tasks
- **Arquivos**: Informações do uploader são carregadas apenas quando `includeFiles=true`
- **Comentários**: Carregados apenas quando `includeComments=true`
- **Cache**: Responses não são cacheadas devido à natureza dinâmica dos dados
- **Segurança**: Clientes só podem executar ações em suas próprias tasks

---

## 🚨 CÓDIGOS DE ERRO ESPECÍFICOS DOS NOVOS ENDPOINTS

### GET /campaigns/tasks/advanced

**400 Bad Request:**
```json
{
  "message": ["Validation failed"],
  "error": "Bad Request",
  "statusCode": 400
}
```

**403 Forbidden:**
```json
{
  "message": "Forbidden resource",
  "error": "Forbidden",
  "statusCode": 403
}
```

### POST /campaigns/{campaignId}/tasks/{taskId}/client-action

**400 Bad Request - Missing Comment:**
```json
{
  "message": "Comentário é obrigatório",
  "error": "Bad Request",
  "statusCode": 400
}
```

**400 Bad Request - Invalid Action:**
```json
{
  "message": "Ação inválida",
  "error": "Bad Request",
  "statusCode": 400
}
```

**400 Bad Request - Task Already Completed:**
```json
{
  "message": "Não é possível modificar uma task já concluída ou arquivada",
  "error": "Bad Request",
  "statusCode": 400
}
```

**403 Forbidden - Not Authorized:**
```json
{
  "message": "Você não tem permissão para acessar esta task",
  "error": "Forbidden",
  "statusCode": 403
}
```

**404 Not Found - Task Not Found:**
```json
{
  "message": "Task não encontrada ou não pertence a este cliente",
  "error": "Not Found",
  "statusCode": 404
}
```

---

## 🔄 ATUALIZAÇÕES DOS COMENTÁRIOS

### Novos Campos nos Comentários

Todos os endpoints que retornam comentários de tasks agora incluem campos adicionais para melhorar a experiência do usuário:

**Campos Adicionais:**
- `authorName`: Nome do autor do comentário (nome do funcionário, nome completo do cliente ou email como fallback)
- `authorProfilePhoto`: URL da foto de perfil do autor (pode ser null)

**Estrutura Completa do Comentário:**
```json
{
  "id": "comment_id",
  "content": "Texto do comentário",
  "createdAt": "2024-01-01T12:00:00.000Z",
  "authorName": "Nome do Autor",
  "authorProfilePhoto": "https://example.com/photos/author.jpg",
  "author": {
    "id": "user_id",
    "email": "author@example.com",
    "role": "CLIENT|EMPLOYEE|ADMIN",
    "profilePhoto": "https://example.com/photos/author.jpg",
    "employee": {
      "name": "Nome do Funcionário"
    },
    "client": {
      "fullName": "Nome Completo do Cliente"
    }
  }
}
```

**Lógica de `authorName`:**
1. Se for funcionário: usa `author.employee.name`
2. Se for cliente: usa `author.client.fullName`
3. Fallback: usa `author.email`

**Endpoints Afetados:**
- `GET /campaigns/:campaignId/tasks/:taskId/comments`
- `POST /campaigns/:campaignId/tasks/:taskId/comments`
- `POST /campaigns/:campaignId/tasks/:taskId/client-action` (ações REJECT e COMMENT)
- `GET /campaigns/tasks/advanced` (quando `includeComments=true`)
- Todos os endpoints que retornam campanhas com tasks e comentários

### Benefícios para o Cliente

- **Interface mais limpa**: Não precisa processar dados do author para exibir nome
- **Foto de perfil direta**: Campo `authorProfilePhoto` diretamente disponível
- **Compatibilidade**: Campos `author` originais mantidos para retrocompatibilidade
- **Performance**: Reduz processamento no frontend

3. **Validações:** Verificação de atribuição antes de permitir alterações

---

## 📦 ENDPOINT DE CAMPANHAS ARQUIVADAS

### GET /campaigns/archived
Retorna todas as campanhas com status `ARCHIVED`, com filtros e estatísticas completas.

**Acessível por:** ADMIN, EMPLOYEE, CLIENT

**Query Parameters:**
```typescript
{
  // Paginação
  page?: number               // Página (default: 1)
  limit?: number              // Items per page (default: 20, max: 100)

  // Busca textual
  search?: string             // Busca por nome ou descrição da campanha

  // Filtros
  status?: string             // Status específico (será ignorado, sempre ARCHIVED)
  clientId?: string           // ID do cliente (apenas ADMIN pode usar)

  // Ordenação
  sortBy?: string             // Campo para ordenação: 'name', 'startDate', 'endDate', 'createdAt' (default: 'createdAt')
  sortOrder?: string          // Direção: 'asc' ou 'desc' (default: 'desc')
}
```

**Response:**
```json
{
  "campaigns": [
    {
      "id": "campaign_id",
      "name": "Campanha Arquivada",
      "description": "Descrição da campanha finalizada",
      "budget": 15000.00,
      "startDate": "2024-01-01T00:00:00.000Z",
      "endDate": "2024-03-31T23:59:59.000Z",
      "status": "ARCHIVED",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-04-01T10:00:00.000Z",
      "client": {
        "id": "client_id",
        "fullName": "Cliente Nome",
        "phone": "+55 11 99999-9999"
      },
      "serviceRequest": {
        "id": "service_request_id",
        "projectName": "Projeto Finalizado",
        "description": "Desenvolvimento completo",
        "status": "COMPLETED",
        "creditsCost": 500,
        "service": {
          "id": "service_id",
          "name": "web-development",
          "displayName": "Desenvolvimento Web",
          "credits": 100
        }
      },
      "assignees": [
        {
          "employee": {
            "id": "employee_id",
            "name": "Funcionário Nome",
            "position": "Developer",
            "user": {
              "email": "dev@empresa.com"
            }
          }
        }
      ],
      "stats": {
        "totalTasks": 15,
        "completedTasks": 15,
        "pendingTasks": 0,
        "totalEstimatedHours": 120,
        "totalSpentHours": 118,
        "progress": 100,
        "totalComments": 45
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 8,
    "pages": 1
  },
  "summary": {
    "total": 8,
    "totalEstimatedHours": 960,
    "totalSpentHours": 944,
    "totalTasks": 120,
    "totalComments": 360
  }
}
```

**Comportamento por Role:**
- **ADMIN**: Visualiza todas as campanhas arquivadas do sistema
- **EMPLOYEE**: Visualiza apenas campanhas arquivadas onde esteve atribuído
- **CLIENT**: Visualiza apenas suas próprias campanhas arquivadas

**Estatísticas Incluídas:**
- **Por Campanha**: tasks totais/concluídas, horas estimadas/gastas, progresso, comentários
- **Resumo Geral**: totais agregados de todas as campanhas arquivadas

**Filtros Disponíveis:**
- **Busca textual**: Nome e descrição da campanha
- **Cliente específico**: Apenas para ADMIN (parâmetro `clientId`)
- **Ordenação**: Por nome, datas ou data de criação

---

## 🔧 EXEMPLOS DE USO - CAMPANHAS ARQUIVADAS

### 1. Listar todas as campanhas arquivadas (ADMIN)
```bash
GET /campaigns/archived
```

### 2. Buscar campanhas arquivadas por nome
```bash
GET /campaigns/archived?search=projeto&limit=10
```

### 3. Campanhas arquivadas de um cliente específico (ADMIN)
```bash
GET /campaigns/archived?clientId=client_123&sortBy=endDate&sortOrder=desc
```

### 4. Campanhas arquivadas paginadas
```bash
GET /campaigns/archived?page=2&limit=5&sortBy=name&sortOrder=asc
```

### 5. Employee visualizando suas campanhas arquivadas
```bash
GET /campaigns/archived
# Retorna apenas campanhas onde o employee esteve atribuído
```

### 6. Cliente visualizando suas campanhas arquivadas
```bash
GET /campaigns/archived
# Retorna apenas campanhas do próprio cliente
```

---

## 🚨 CÓDIGOS DE ERRO - CAMPANHAS ARQUIVADAS

### GET /campaigns/archived

**400 Bad Request - Parâmetros inválidos:**
```json
{
  "message": ["Validation failed"],
  "error": "Bad Request",
  "statusCode": 400
}
```

**403 Forbidden - Sem permissão:**
```json
{
  "message": "Forbidden resource",
  "error": "Forbidden",
  "statusCode": 403
}
```

**400 Bad Request - Cliente não encontrado:**
```json
{
  "message": "Client profile not found",
  "error": "Bad Request",
  "statusCode": 400
}
```

---

## ℹ️ INFORMAÇÕES IMPORTANTES - CAMPANHAS ARQUIVADAS

### Critérios de Filtragem
1. **Status fixo**: Sempre filtra por `status = 'ARCHIVED'`
2. **Controle de acesso**: Respeita hierarquia de permissões
3. **Busca case-insensitive**: Nome e descrição da campanha

### Estatísticas Calculadas
1. **Progress**: Percentual de tasks concluídas (sempre 100% para campanhas arquivadas bem finalizadas)
2. **Horas**: Estimadas vs gastas para análise de performance
3. **Comentários**: Total de interações durante o projeto

### Performance
1. **Paginação obrigatória**: Máximo 100 items por página
2. **Índices recomendados**: `status`, `clientId`, `updatedAt`
3. **Dados agregados**: Estatísticas calculadas em tempo real

### Casos de Uso
1. **Relatórios históricos**: Análise de projetos finalizados
2. **Portfolio de clientes**: Trabalhos anteriores realizados
3. **Análise de performance**: Comparação estimativa vs realidade
4. **Auditoria**: Rastreamento de campanhas encerradas

---

## 📁 ENDPOINT DE ARQUIVAMENTO DE CAMPANHAS

### PATCH /campaigns/{id}/archive
Permite que ADMIN e EMPLOYEE arquivem uma campanha, alterando seu status para `ARCHIVED`.

**Acessível por:** ADMIN, EMPLOYEE (apenas campanhas atribuídas)

**Path Parameters:**
- `id`: ID da campanha a ser arquivada

**Request:**
```http
PATCH /campaigns/{campaignId}/archive
Authorization: Bearer {token}
Content-Type: application/json
```

**Response Success (200):**
```json
{
  "message": "Campaign archived successfully",
  "campaign": {
    "id": "campaign_id",
    "name": "Nome da Campanha",
    "status": "ARCHIVED",
    "client": {
      "id": "client_id",
      "fullName": "Cliente Nome"
    },
    "assignees": [
      {
        "employee": {
          "id": "employee_id",
          "name": "Funcionário Nome",
          "position": "Developer"
        }
      }
    ],
    "archivedAt": "2024-01-15T14:30:00.000Z",
    "stats": {
      "totalTasks": 12,
      "totalComments": 45,
      "pendingTasksCount": 2
    }
  },
  "warnings": [
    "Campaign archived with 2 pending tasks"
  ]
}
```

**Comportamento por Role:**
- **ADMIN**: Pode arquivar qualquer campanha do sistema
- **EMPLOYEE**: Pode arquivar apenas campanhas onde está atribuído

**Validações Realizadas:**
1. **Campanha existe**: Verifica se a campanha existe no sistema
2. **Status atual**: Verifica se a campanha não está já arquivada
3. **Permissões**: EMPLOYEE só pode arquivar campanhas atribuídas
4. **Tasks pendentes**: Informa sobre tasks não concluídas (warning)

**Informações Retornadas:**
- **Dados da campanha**: ID, nome, status atualizado
- **Cliente**: Informações básicas do cliente
- **Assignees**: Funcionários atribuídos à campanha
- **Estatísticas**: Contadores de tasks e comentários
- **Warnings**: Alertas sobre tasks pendentes

---

## 🔧 EXEMPLOS DE USO - ARQUIVAMENTO

### 1. ADMIN arquivando qualquer campanha
```bash
PATCH /campaigns/camp_123/archive
Authorization: Bearer {admin_token}
```

### 2. EMPLOYEE arquivando campanha atribuída
```bash
PATCH /campaigns/camp_456/archive
Authorization: Bearer {employee_token}
```

### 3. Resposta com tasks pendentes
```json
{
  "message": "Campaign archived successfully",
  "campaign": {
    "id": "camp_123",
    "name": "Projeto Website",
    "status": "ARCHIVED",
    "archivedAt": "2024-01-15T14:30:00.000Z",
    "stats": {
      "totalTasks": 15,
      "totalComments": 67,
      "pendingTasksCount": 3
    }
  },
  "warnings": [
    "Campaign archived with 3 pending tasks"
  ]
}
```

### 4. Resposta sem tasks pendentes
```json
{
  "message": "Campaign archived successfully",
  "campaign": {
    "id": "camp_789",
    "name": "App Mobile",
    "status": "ARCHIVED",
    "archivedAt": "2024-01-15T14:30:00.000Z",
    "stats": {
      "totalTasks": 20,
      "totalComments": 89,
      "pendingTasksCount": 0
    }
  },
  "warnings": []
}
```

---

## 🚨 CÓDIGOS DE ERRO - ARQUIVAMENTO

### PATCH /campaigns/{id}/archive

**404 Not Found - Campanha não encontrada:**
```json
{
  "message": "Campaign not found",
  "error": "Not Found",
  "statusCode": 404
}
```

**400 Bad Request - Campanha já arquivada:**
```json
{
  "message": "Campaign is already archived",
  "error": "Bad Request",
  "statusCode": 400
}
```

**403 Forbidden - Employee não atribuído:**
```json
{
  "message": "You are not assigned to this campaign",
  "error": "Forbidden",
  "statusCode": 403
}
```

**403 Forbidden - Sem permissão:**
```json
{
  "message": "Forbidden resource",
  "error": "Forbidden",
  "statusCode": 403
}
```

**401 Unauthorized - Token inválido:**
```json
{
  "message": "Unauthorized",
  "error": "Unauthorized",
  "statusCode": 401
}
```

---

## ⚠️ CONSIDERAÇÕES IMPORTANTES - ARQUIVAMENTO

### Política de Arquivamento
1. **Irreversível**: Uma vez arquivada, a campanha não pode ser "desarquivada" via API
2. **Tasks pendentes**: Sistema permite arquivamento mesmo com tasks pendentes (com warning)
3. **Atualizações**: Campo `updatedAt` é atualizado com timestamp do arquivamento

### Permissões e Segurança
1. **ADMIN**: Acesso irrestrito para arquivamento
2. **EMPLOYEE**: Só pode arquivar campanhas atribuídas
3. **CLIENT**: Não pode arquivar campanhas

### Impactos do Arquivamento
1. **Visibilidade**: Campanha aparece apenas em `/campaigns/archived`
2. **Operações**: Demais operações (tasks, comentários) permanecem funcionais
3. **Relatórios**: Incluída em estatísticas de campanhas arquivadas

### Boas Práticas
1. **Verificar conclusão**: Revisar se todas as tasks importantes estão concluídas
2. **Comunicação**: Informar cliente sobre arquivamento quando necessário
3. **Documentação**: Adicionar comentários finais antes do arquivamento
4. **Backup**: Considerar exportar dados importantes antes do arquivamento
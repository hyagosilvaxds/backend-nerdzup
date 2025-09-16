# Nerdzup Marketing Agency API

Sistema de autenticação completo com JWT, recuperação de senha e login passwordless para agência de marketing.

## 🚀 Funcionalidades

### 🔐 Autenticação
- **Login tradicional** com email/senha
- **Login passwordless** com código enviado por email
- **Recuperação de senha** via email
- **JWT tokens** com expiração de 7 dias
- **Roles e permissões** granulares

### 👥 Gestão de Usuários
- **Clientes**: Registro público com dados da empresa
- **Funcionários**: Registro restrito com sistema de permissões
- **Administradores**: Controle total do sistema

### 📧 Sistema de Email
- **SMTP configurável** (Gmail/outros provedores)
- **Templates responsivos** em HTML
- **Emails transacionais**:
  - Recuperação de senha
  - Códigos de login passwordless
  - Boas-vindas para novos usuários

### 📝 Formulários de Lead
- **Formulários configuráveis** multi-etapas
- **Tipos de input diversos**: texto, email, número, arquivo, seleção múltipla
- **Validação automática** de campos obrigatórios
- **Submissão progressiva** - salva parcialmente
- **Analytics** de conversão e abandono
- **Interface pública** para captura de leads

### 🛠️ Gerenciamento de Serviços
- **Catálogo de serviços** organizados por categorias
- **Sistema de créditos** para precificação
- **Três níveis de dificuldade**: Básico, Intermediário, Avançado
- **Sistema de avaliações** de 0.0 a 5.0
- **Recursos e benefícios** detalhados
- **Serviços destacados** e populares
- **Filtros avançados** por preço, tempo, categoria, etc.

### 📋 Gerenciamento de Tarefas
- **Tarefas vinculadas** a serviços, clientes e funcionários
- **Sistema de prioridades** configuráveis pela equipe
- **Controle de progresso** com percentuais de conclusão
- **Gestão de prazos** com detecção automática de atrasos
- **Upload de arquivos** diferenciado (inspirações do cliente, entregáveis da equipe)
- **Sistema de comentários** para comunicação cliente-funcionário
- **Status personalizados**: BACKLOG, ANDAMENTO, REVISÃO, CONCLUÍDO, ATRASADO, ARQUIVADO
- **Board Kanban** para visualização e gestão de fluxo
- **Dashboard de estatísticas** e métricas de produtividade

## 🛠️ Configuração

### Requisitos
- Node.js 18+
- PostgreSQL 12+
- Conta de email para SMTP (Gmail recomendado)

### Instalação

1. **Clone o repositório**
```bash
git clone <repository-url>
cd nerdzup-backend
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure o banco de dados**
```bash
# Edite o arquivo .env com suas credenciais do PostgreSQL
DATABASE_URL="postgresql://user:password@localhost:5432/nerdzup"

# Execute as migrações
npx prisma migrate deploy
npx prisma generate
```

4. **Configure o email**
```bash
# Para Gmail, crie uma "Senha de App" em sua conta Google
# https://support.google.com/accounts/answer/185833

# Edite o .env:
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-gmail@gmail.com"
SMTP_PASS="your-app-password"
SMTP_FROM="noreply@nerdzup.com"
SMTP_FROM_NAME="Nerdzup Marketing Agency"
```

5. **Configure as URLs**
```bash
# .env
APP_URL="http://localhost:4000"
FRONTEND_URL="http://localhost:3000"
JWT_SECRET="your-super-secret-jwt-key-here"
```

### Executar

```bash
# Desenvolvimento
npm run start:dev

# Produção
npm run build
npm run start:prod
```

## 📋 API Endpoints

### Autenticação
- `POST /auth/login` - Login tradicional
- `POST /auth/register/client` - Registro de cliente (público)
- `POST /auth/register/employee` - Registro de funcionário (restrito)
- `GET /auth/profile` - Perfil do usuário logado

### Recuperação de Senha
- `POST /auth/forgot-password` - Solicitar recuperação
- `POST /auth/reset-password` - Resetar com token

### Login Passwordless
- `POST /auth/request-login-code` - Solicitar código
- `POST /auth/verify-login-code` - Verificar código e autenticar

### Foto de Perfil
- `POST /auth/profile-photo/upload` - Upload de foto de perfil
- `PATCH /auth/profile-photo` - Atualizar URL da foto de perfil
- `POST /auth/profile-photo/remove` - Remover foto de perfil

### Funcionários
- `POST /employees` - Criar funcionário
- `GET /employees` - Listar funcionários
- `GET /employees/:id` - Buscar funcionário
- `PATCH /employees/:id` - Editar funcionário
- `DELETE /employees/:id` - Deletar funcionário
- `POST /employees/:id/permissions` - Atribuir permissões
- `DELETE /employees/:id/permissions` - Remover permissões

### Clientes
- `POST /clients` - Criar cliente
- `GET /clients` - Listar clientes
- `GET /clients/:id` - Buscar cliente
- `PATCH /clients/:id` - Editar cliente
- `DELETE /clients/:id` - Deletar cliente
- `PATCH /clients/:id/toggle-status` - Ativar/desativar

### Formulários de Lead
- `POST /lead-forms` - Criar formulário (admin)
- `GET /lead-forms` - Listar formulários (admin)
- `GET /lead-forms/:id` - Buscar formulário (admin)
- `GET /lead-forms/name/:name` - Buscar por nome (público)
- `PATCH /lead-forms/:id` - Editar formulário (admin)
- `DELETE /lead-forms/:id` - Deletar formulário (admin)
- `POST /lead-forms/:id/activate` - Ativar formulário (admin)
- `POST /lead-forms/:id/deactivate` - Desativar formulário (admin)
- `GET /lead-forms/:id/analytics` - Analytics do formulário (admin)
- `POST /lead-forms/:id/duplicate` - Duplicar formulário (admin)

### Submissões de Lead
- `POST /lead-submissions/start` - Iniciar submissão (público)
- `POST /lead-submissions/submit` - Enviar respostas (público)
- `POST /lead-submissions/complete` - Completar formulário (público)
- `GET /lead-submissions` - Listar submissões (admin)
- `GET /lead-submissions/stats` - Estatísticas (admin)
- `GET /lead-submissions/:id` - Buscar submissão (admin)
- `DELETE /lead-submissions/:id` - Deletar submissão (admin)

### Categorias de Serviços
- `POST /service-categories` - Criar categoria (admin)
- `GET /service-categories` - Listar categorias
- `GET /service-categories/stats` - Estatísticas (admin)
- `GET /service-categories/:id` - Buscar categoria
- `GET /service-categories/name/:name` - Buscar por nome (público)
- `PATCH /service-categories/:id` - Editar categoria (admin)
- `DELETE /service-categories/:id` - Deletar categoria (admin)
- `POST /service-categories/:id/activate` - Ativar categoria (admin)
- `POST /service-categories/:id/deactivate` - Desativar categoria (admin)
- `POST /service-categories/reorder` - Reordenar categorias (admin)

### Serviços
- `POST /services` - Criar serviço (admin)
- `GET /services` - Listar serviços com filtros avançados
- `GET /services/featured` - Serviços destacados (público)
- `GET /services/popular` - Serviços populares (público)
- `GET /services/difficulty/:difficulty` - Por dificuldade (público)
- `GET /services/stats` - Estatísticas (admin)
- `GET /services/:id` - Buscar serviço (público)
- `GET /services/name/:name` - Buscar por nome (público)
- `PATCH /services/:id` - Editar serviço (admin)
- `DELETE /services/:id` - Deletar serviço (admin)
- `POST /services/:id/activate` - Ativar serviço (admin)
- `POST /services/:id/deactivate` - Desativar serviço (admin)
- `POST /services/:id/toggle-featured` - Destacar serviço (admin)
- `POST /services/:id/rating` - Avaliar serviço (público)
- `POST /services/category/:categoryId/reorder` - Reordenar serviços (admin)

### Tarefas
- `POST /tasks` - Criar tarefa (admin/funcionário)
- `GET /tasks` - Listar tarefas com filtros avançados
- `GET /tasks/kanban` - Board Kanban organizado por status
- `GET /tasks/stats` - Estatísticas e métricas de tarefas
- `GET /tasks/:id` - Buscar tarefa detalhada
- `PATCH /tasks/:id` - Editar tarefa (admin/funcionário)
- `PATCH /tasks/:id/status` - Alterar status (toggle para Kanban)
- `PATCH /tasks/:id/progress` - Atualizar progresso (0-100%)
- `POST /tasks/:id/assign` - Atribuir funcionários (admin/funcionário)
- `POST /tasks/:id/comments` - Adicionar comentário
- `POST /tasks/:id/files/inspiration` - Upload arquivo inspiração (cliente)
- `POST /tasks/:id/files/deliverable` - Upload entregável (funcionário)
- `POST /tasks/:id/files/url` - Adicionar arquivo por URL
- `DELETE /tasks/:id/files/:fileId` - Remover arquivo
- `DELETE /tasks/:id` - Deletar tarefa (admin/funcionário)

## 🔑 Sistema de Permissões

### Roles
- `CLIENT` - Acesso básico aos próprios dados
- `EMPLOYEE` - Acesso baseado em permissões
- `ADMIN` - Acesso total

### Permissões Granulares
- `READ_CLIENTS`, `WRITE_CLIENTS`, `DELETE_CLIENTS`
- `READ_EMPLOYEES`, `WRITE_EMPLOYEES`, `DELETE_EMPLOYEES`
- `READ_CAMPAIGNS`, `WRITE_CAMPAIGNS`, `DELETE_CAMPAIGNS`
- `MANAGE_PERMISSIONS` - Gerenciar permissões de outros

## 📨 Postman Collection

Importe a collection em `/postman/Nerdzup_Marketing_Agency_API.postman_collection.json`:

1. Abra o Postman
2. Import > File > Selecione o arquivo JSON
3. Configure as variáveis:
   - `base_url`: `http://localhost:4000`
   - `jwt_token`: (será preenchido automaticamente no login)

## 🗄️ Estrutura do Banco

```sql
-- Usuários base
users (id, email, password, role, isActive)

-- Dados específicos
clients (id, userId, name, company, phone, address, ...)
employees (id, userId, name, position, department, ...)

-- Permissões
employee_permissions (id, employeeId, permission, grantedBy)

-- Tokens para recuperação/login
password_reset_tokens (id, email, token, expiresAt, used)
login_codes (id, email, code, expiresAt, used)

-- Campanhas
campaigns (id, name, description, clientId, employeeId, ...)

-- Formulários de Lead
lead_forms (id, name, displayName, description, initialText, isActive, ...)
lead_form_steps (id, formId, stepNumber, title, description, isRequired, ...)
lead_form_inputs (id, stepId, inputKey, label, inputType, placeholder, options, ...)
lead_submissions (id, formId, email, ipAddress, userAgent, isCompleted, ...)
lead_submission_responses (id, submissionId, stepId, inputKey, value, fileUrl, ...)

-- Gerenciamento de Serviços
service_categories (id, name, displayName, description, iconUrl, color, isActive, order, ...)
services (id, name, displayName, description, categoryId, credits, estimatedDays, difficulty, rating, ratingCount, iconUrl, features, benefits, isActive, isFeatured, tags, order, ...)

-- Gerenciamento de Tarefas
tasks (id, title, description, serviceId, clientId, campaignId, status, priority, progress, dueDate, completedAt, ...)
task_assignees (id, taskId, employeeId, assignedAt, assignedBy)
task_files (id, taskId, fileName, fileUrl, fileType, uploadedBy, uploadedAt, description)
task_comments (id, taskId, authorId, content, createdAt, updatedAt)
```

## 📖 Endpoints de Upload de Ícones de Serviços

### 🆕 Criar Serviço com Ícone
**`POST /services/with-icon`**

Cria um novo serviço com upload de ícone em uma única requisição.

#### Headers
```
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

#### Parâmetros (Form Data)
| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `icon` | file | Não | Arquivo de imagem do ícone |
| `name` | string | Sim | Nome único do serviço (slug) |
| `displayName` | string | Sim | Nome de exibição |
| `description` | string | Sim | Descrição detalhada |
| `shortDescription` | string | Sim | Descrição resumida |
| `categoryId` | string | Sim | ID da categoria |
| `credits` | number | Sim | Valor em créditos |
| `estimatedDays` | number | Sim | Prazo estimado em dias |
| `difficulty` | string | Sim | BASICO, INTERMEDIARIO ou AVANÇADO |
| `features` | string | Não | Array JSON de funcionalidades |
| `benefits` | string | Não | Array JSON de benefícios |
| `tags` | string | Não | Array JSON de tags |
| `isActive` | boolean | Não | Status ativo (padrão: true) |
| `isFeatured` | boolean | Não | Serviço destacado (padrão: false) |

#### Validações do Arquivo
- **Tipos aceitos**: JPEG, PNG, GIF, WebP, SVG
- **Tamanho máximo**: 1GB
- **Campo opcional**: Se não fornecido, serviço é criado sem ícone

#### Exemplo de Uso (JavaScript)
```javascript
const formData = new FormData();
formData.append('icon', file); // File object
formData.append('name', 'consultoria-digital');
formData.append('displayName', 'Consultoria Digital');
formData.append('description', 'Análise completa da presença digital...');
formData.append('shortDescription', 'Consultoria em marketing digital');
formData.append('categoryId', 'cm123abc');
formData.append('credits', '250');
formData.append('estimatedDays', '15');
formData.append('difficulty', 'INTERMEDIARIO');
formData.append('features', '["Análise SWOT", "Plano de Ação"]');
formData.append('isActive', 'true');

fetch('/services/with-icon', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + token
  },
  body: formData
});
```

#### Resposta de Sucesso (201)
```json
{
  "id": "cm456def",
  "name": "consultoria-digital",
  "displayName": "Consultoria Digital",
  "description": "Análise completa da presença digital...",
  "iconUrl": "http://localhost:4000/uploads/service-icons/uuid.png",
  "credits": 250,
  "estimatedDays": 15,
  "difficulty": "INTERMEDIARIO",
  "category": {
    "id": "cm123abc",
    "name": "Consultoria",
    "displayName": "Consultoria",
    "color": "#3B82F6"
  }
}
```

---

### 🔄 Upload de Ícone para Serviço Existente
**`POST /services/:id/upload-icon`**

Faz upload ou atualiza o ícone de um serviço já criado.

#### Headers
```
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

#### Parâmetros da URL
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `id` | string | ID do serviço |

#### Parâmetros (Form Data)
| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `icon` | file | **Sim** | Arquivo de imagem do ícone |

#### Validações do Arquivo
- **Tipos aceitos**: JPEG, PNG, GIF, WebP, SVG
- **Tamanho máximo**: 1GB

#### Exemplo de Uso (JavaScript)
```javascript
const formData = new FormData();
formData.append('icon', file); // File object

fetch('/services/cm456def/upload-icon', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + token
  },
  body: formData
});
```

#### Resposta de Sucesso (200)
```json
{
  "id": "cm456def",
  "name": "consultoria-digital",
  "displayName": "Consultoria Digital",
  "iconUrl": "http://localhost:4000/uploads/service-icons/new-uuid.png",
  "category": {
    "id": "cm123abc",
    "name": "Consultoria",
    "displayName": "Consultoria",
    "color": "#3B82F6"
  }
}
```

### ⚠️ Códigos de Erro

#### 400 Bad Request
```json
{
  "message": "No file provided",
  "error": "Bad Request"
}
```

```json
{
  "message": "Invalid file type. Only JPEG, PNG, GIF, WebP, and SVG are allowed",
  "error": "Bad Request"
}
```

```json
{
  "message": "File too large. Maximum size is 1GB",
  "error": "Bad Request"
}
```

#### 404 Not Found
```json
{
  "message": "Serviço não encontrado",
  "error": "Not Found"
}
```

### 💡 Dicas de Implementação

1. **Otimização de Imagens**: Recomenda-se otimizar imagens antes do upload para melhor performance
2. **Preview**: Implemente preview do arquivo selecionado antes do upload
3. **Progress**: Para arquivos maiores, considere mostrar progresso do upload
4. **Fallback**: Tenha ícones padrão para serviços sem ícone personalizado
5. **Cache**: URLs de ícone podem ser cacheadas pelo navegador

---

## 🔒 Segurança

- **Passwords** criptografados com bcrypt
- **JWT tokens** com expiração
- **Rate limiting** recomendado para produção
- **Tokens de uso único** para recuperação/login
- **Validação rigorosa** de inputs
- **Não exposição** de informações sensíveis

## 🚀 Deploy em Produção

### Variáveis de Ambiente Importantes
```bash
NODE_ENV=production
DATABASE_URL="postgresql://..."
JWT_SECRET="strong-random-secret"
SMTP_HOST="smtp.gmail.com"
SMTP_USER="your-production-email"
SMTP_PASS="your-app-password"
```

### Recomendações
- Use HTTPS em produção
- Configure rate limiting
- Monitore logs de acesso
- Backup regular do banco
- Configure CORS adequadamente

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT.
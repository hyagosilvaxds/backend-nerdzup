# 🔔 Sistema de Notificações - Nerdzup Backend

## Visão Geral

O sistema de notificações permite enviar, gerenciar e receber notificações em tempo real para usuários da plataforma. Suporta diferentes tipos de notificações, prioridades e ações específicas.

## 📊 Tipos de Notificação

### Service Requests
- `SERVICE_REQUEST_APPROVED` - Solicitação de serviço aprovada
- `SERVICE_REQUEST_REJECTED` - Solicitação de serviço rejeitada  
- `SERVICE_REQUEST_ASSIGNED` - Solicitação atribuída a funcionários
- `SERVICE_REQUEST_COMPLETED` - Serviço concluído

### Tasks
- `TASK_ASSIGNED` - Tarefa atribuída
- `TASK_COMPLETED` - Tarefa concluída
- `TASK_DUE_SOON` - Tarefa próxima do prazo

### Billing
- `PAYMENT_SUCCESS` - Pagamento processado com sucesso
- `PAYMENT_FAILED` - Falha no pagamento
- `SUBSCRIPTION_EXPIRED` - Assinatura expirada
- `SUBSCRIPTION_RENEWED` - Assinatura renovada
- `CREDITS_LOW` - Créditos baixos

### System
- `SYSTEM_ANNOUNCEMENT` - Anúncio do sistema
- `GENERAL` - Notificação geral

## 📈 Níveis de Prioridade

- `LOW` - Baixa prioridade
- `MEDIUM` - Prioridade média (padrão)
- `HIGH` - Alta prioridade 
- `URGENT` - Urgente

---

## 🎯 Endpoints da API

### **Para Usuários (Autenticados)**

#### Get My Notifications
**GET** `/notifications`

**Permissões**: Usuários autenticados

##### Query Parameters
```
type?: NotificationType          // Filtrar por tipo
priority?: NotificationPriority  // Filtrar por prioridade  
isRead?: boolean                 // Filtrar por status de leitura
page?: number = 1                // Página (paginação)
limit?: number = 20              // Itens por página
search?: string                  // Busca em título/mensagem
```

##### Response (200 OK)
```json
{
  "notifications": [
    {
      "id": "notif_123",
      "type": "SERVICE_REQUEST_APPROVED",
      "title": "Solicitação de Serviço Aprovada",
      "message": "Sua solicitação para o projeto \"Website E-commerce\" foi aprovada e está sendo processada.",
      "data": {
        "serviceRequestId": "req_456",
        "projectName": "Website E-commerce"
      },
      "isRead": false,
      "actionUrl": "/service-requests/req_456",
      "priority": "HIGH",
      "expiresAt": null,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z",
      "recipient": {
        "id": "user_789",
        "email": "cliente@exemplo.com",
        "role": "CLIENT",
        "profilePhoto": "https://cdn.nerdzup.com/profile.jpg"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 5,
    "totalPages": 1
  }
}
```

#### Get Notification Stats
**GET** `/notifications/stats`

**Permissões**: Usuários autenticados

##### Response (200 OK)
```json
{
  "total": 15,
  "unread": 3,
  "read": 12,
  "byType": {
    "SERVICE_REQUEST_APPROVED": 5,
    "PAYMENT_SUCCESS": 3,
    "TASK_ASSIGNED": 4,
    "CREDITS_LOW": 3
  },
  "byPriority": {
    "HIGH": 2,
    "MEDIUM": 1,
    "LOW": 0
  }
}
```

#### Get Single Notification
**GET** `/notifications/:id`

**Permissões**: Usuários autenticados (apenas próprias notificações)

##### Response (200 OK)
```json
{
  "id": "notif_123",
  "type": "SERVICE_REQUEST_APPROVED",
  "title": "Solicitação de Serviço Aprovada",
  "message": "Sua solicitação para o projeto \"Website E-commerce\" foi aprovada.",
  "data": {
    "serviceRequestId": "req_456",
    "projectName": "Website E-commerce"
  },
  "isRead": false,
  "actionUrl": "/service-requests/req_456",
  "priority": "HIGH",
  "expiresAt": null,
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z",
  "recipient": {
    "id": "user_789",
    "email": "cliente@exemplo.com",
    "role": "CLIENT",
    "profilePhoto": "https://cdn.nerdzup.com/profile.jpg"
  }
}
```

#### Mark Notification as Read
**PATCH** `/notifications/:id/read`

**Permissões**: Usuários autenticados (apenas próprias notificações)

##### Response (200 OK)
```json
{
  "id": "notif_123",
  "isRead": true,
  "updatedAt": "2024-01-15T11:00:00.000Z"
}
```

#### Mark Multiple/All Notifications as Read
**PATCH** `/notifications/mark-all-read`

**Permissões**: Usuários autenticados

##### Request Body
```json
{
  "notificationIds": ["notif_123", "notif_456"]  // Opcional - se vazio, marca todas como lidas
}
```

##### Response (200 OK)
```json
{
  "count": 2,
  "message": "2 notification(s) marked as read"
}
```

#### Delete Notification
**DELETE** `/notifications/:id`

**Permissões**: Usuários autenticados (apenas próprias notificações)

##### Response (200 OK)
```json
{
  "message": "Notification deleted successfully"
}
```

#### Delete All Read Notifications
**DELETE** `/notifications/read/all`

**Permissões**: Usuários autenticados

##### Response (200 OK)
```json
{
  "count": 8,
  "message": "8 read notification(s) deleted"
}
```

---

### **Para Admins e Funcionários**

#### Create Single Notification
**POST** `/notifications`

**Permissões**: `ADMIN` e `EMPLOYEE`

##### Request Body
```json
{
  "recipientId": "user_789",
  "type": "SYSTEM_ANNOUNCEMENT",
  "title": "Manutenção Programada",
  "message": "Sistema entrará em manutenção às 02:00 de amanhã.",
  "data": {
    "maintenanceDate": "2024-01-16T02:00:00.000Z",
    "duration": "2 horas"
  },
  "actionUrl": "/system/maintenance",
  "priority": "HIGH",
  "expiresAt": "2024-01-16T06:00:00.000Z"
}
```

##### Response (201 Created)
```json
{
  "id": "notif_890",
  "recipientId": "user_789",
  "type": "SYSTEM_ANNOUNCEMENT",
  "title": "Manutenção Programada",
  "message": "Sistema entrará em manutenção às 02:00 de amanhã.",
  "data": {
    "maintenanceDate": "2024-01-16T02:00:00.000Z",
    "duration": "2 horas"
  },
  "isRead": false,
  "actionUrl": "/system/maintenance",
  "priority": "HIGH",
  "expiresAt": "2024-01-16T06:00:00.000Z",
  "createdAt": "2024-01-15T14:30:00.000Z",
  "updatedAt": "2024-01-15T14:30:00.000Z"
}
```

#### Create Bulk Notifications
**POST** `/notifications/bulk`

**Permissões**: `ADMIN` e `EMPLOYEE`

##### Request Body
```json
[
  {
    "recipientId": "user_123",
    "type": "SYSTEM_ANNOUNCEMENT",
    "title": "Atualização do Sistema",
    "message": "Nova versão disponível com melhorias."
  },
  {
    "recipientId": "user_456",
    "type": "SYSTEM_ANNOUNCEMENT", 
    "title": "Atualização do Sistema",
    "message": "Nova versão disponível com melhorias."
  }
]
```

##### Response (201 Created)
```json
{
  "count": 2,
  "notifications": [
    {
      "id": "notif_901",
      "recipientId": "user_123",
      "type": "SYSTEM_ANNOUNCEMENT",
      "title": "Atualização do Sistema",
      "message": "Nova versão disponível com melhorias.",
      "isRead": false,
      "priority": "MEDIUM",
      "createdAt": "2024-01-15T15:00:00.000Z"
    },
    {
      "id": "notif_902",
      "recipientId": "user_456",
      "type": "SYSTEM_ANNOUNCEMENT", 
      "title": "Atualização do Sistema",
      "message": "Nova versão disponível com melhorias.",
      "isRead": false,
      "priority": "MEDIUM",
      "createdAt": "2024-01-15T15:00:00.000Z"
    }
  ]
}
```



---

## 🛠️ Métodos Helper do Service

O `NotificationsService` inclui métodos helper para criar notificações específicas:

### Service Request Notifications
```typescript
// Notificar aprovação
await notificationsService.notifyServiceRequestApproved(
  'req_123', 
  'client_456', 
  'Website E-commerce'
);

// Notificar rejeição  
await notificationsService.notifyServiceRequestRejected(
  'req_123',
  'client_456', 
  'Website E-commerce',
  'Informações insuficientes'
);
```

### Task Notifications
```typescript
// Notificar atribuição de tarefa
await notificationsService.notifyTaskAssigned(
  'task_789',
  'employee_123',
  'Desenvolvimento da Landing Page'
);
```

### Payment Notifications
```typescript
// Notificar pagamento bem-sucedido
await notificationsService.notifyPaymentSuccess(
  'user_456',
  299.99,
  'Pacote Premium de créditos'
);

// Notificar créditos baixos
await notificationsService.notifyCreditsLow('user_456', 10);
```

---

## 🎨 Integração Frontend

### 1. Hook para Notificações (React)
```tsx
import { useState, useEffect } from 'react';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  priority: string;
  actionUrl?: string;
  createdAt: string;
}

interface NotificationStats {
  total: number;
  unread: number;
  read: number;
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async (params?: any) => {
    try {
      const query = new URLSearchParams(params).toString();
      const response = await fetch(`/api/notifications?${query}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      setNotifications(data.notifications);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/notifications/stats', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}/read`, {
        method: 'PATCH',
        headers: { 
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === id ? { ...notif, isRead: true } : notif
        )
      );
      
      if (stats) {
        setStats(prev => ({
          ...prev!,
          unread: prev!.unread - 1,
          read: prev!.read + 1
        }));
      }
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch('/api/notifications/mark-all-read', {
        method: 'PATCH',
        headers: { 
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, isRead: true }))
      );
      
      if (stats) {
        setStats(prev => ({
          ...prev!,
          unread: 0,
          read: prev!.total
        }));
      }
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    fetchStats();
  }, []);

  return {
    notifications,
    stats,
    loading,
    fetchNotifications,
    fetchStats,
    markAsRead,
    markAllAsRead
  };
};
```

### 2. Componente de Notificações
```tsx
import React from 'react';
import { useNotifications } from './hooks/useNotifications';

const NotificationCenter: React.FC = () => {
  const { 
    notifications, 
    stats, 
    loading, 
    markAsRead, 
    markAllAsRead 
  } = useNotifications();

  if (loading) return <div>Carregando notificações...</div>;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT': return 'red';
      case 'HIGH': return 'orange';
      case 'MEDIUM': return 'blue';
      case 'LOW': return 'gray';
      default: return 'gray';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'SERVICE_REQUEST_APPROVED': return '✅';
      case 'SERVICE_REQUEST_REJECTED': return '❌';
      case 'TASK_ASSIGNED': return '📋';
      case 'PAYMENT_SUCCESS': return '💳';
      case 'CREDITS_LOW': return '⚠️';
      default: return '🔔';
    }
  };

  return (
    <div className="notification-center">
      <div className="notification-header">
        <h2>Notificações</h2>
        {stats && (
          <div className="notification-stats">
            <span className="unread-count">{stats.unread} não lidas</span>
            <button onClick={markAllAsRead} disabled={stats.unread === 0}>
              Marcar todas como lidas
            </button>
          </div>
        )}
      </div>

      <div className="notification-list">
        {notifications.length === 0 ? (
          <p>Nenhuma notificação encontrada</p>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
              onClick={() => !notification.isRead && markAsRead(notification.id)}
            >
              <div className="notification-content">
                <div className="notification-header-item">
                  <span className="notification-icon">
                    {getTypeIcon(notification.type)}
                  </span>
                  <span className="notification-title">
                    {notification.title}
                  </span>
                  <span 
                    className="notification-priority"
                    style={{ color: getPriorityColor(notification.priority) }}
                  >
                    {notification.priority}
                  </span>
                </div>
                <p className="notification-message">
                  {notification.message}
                </p>
                <span className="notification-time">
                  {new Date(notification.createdAt).toLocaleString('pt-BR')}
                </span>
              </div>
              {!notification.isRead && (
                <div className="unread-indicator"></div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationCenter;
```

### 3. Componente de Badge de Notificação
```tsx
import React from 'react';
import { useNotifications } from './hooks/useNotifications';

const NotificationBadge: React.FC = () => {
  const { stats } = useNotifications();

  if (!stats || stats.unread === 0) {
    return <span className="notification-badge">🔔</span>;
  }

  return (
    <span className="notification-badge with-count">
      🔔
      <span className="notification-count">{stats.unread}</span>
    </span>
  );
};

export default NotificationBadge;
```

---

## 🔧 Configurações Avançadas

### Limpeza Automática de Notificações Expiradas

Você pode configurar um cron job para limpar notificações expiradas automaticamente:

```typescript
import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { NotificationsService } from './notifications.service';

@Injectable()
export class NotificationCronService {
  constructor(private notificationsService: NotificationsService) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async cleanExpiredNotifications() {
    await this.notificationsService.cleanExpiredNotifications();
  }
}
```

### WebSocket para Notificações em Tempo Real

```typescript
// Em um gateway WebSocket
@WebSocketGateway()
export class NotificationsGateway {
  @WebSocketServer()
  server: Server;

  async sendNotificationToUser(userId: string, notification: any) {
    this.server.to(`user_${userId}`).emit('notification', notification);
  }
}
```

---

## 🚀 Próximos Passos

1. **WebSocket Integration**: Implementar notificações em tempo real
2. **Push Notifications**: Adicionar suporte a notificações push no navegador
3. **Email Notifications**: Integrar com sistema de email para notificações importantes
4. **Templates**: Sistema de templates para diferentes tipos de notificação
5. **Analytics**: Dashboard para analytics de notificações

---

## 📝 Notas de Implementação

- Todas as notificações expiradas são automaticamente filtradas nas consultas
- O sistema suporta dados JSON customizados para cada notificação
- URLs de ação são opcionais e podem direcionar para páginas específicas
- O sistema é otimizado para consultas rápidas com índices apropriados
- Suporte completo a paginação para grandes volumes de notificações
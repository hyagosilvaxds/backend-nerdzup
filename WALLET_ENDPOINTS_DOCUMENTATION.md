# 💰 Wallet & Billing API - Nerdzup Backend

## Visão Geral

A API de Wallet e Billing gerencia créditos de clientes, assinaturas, pacotes de créditos, transações e relatórios financeiros. Todos os endpoints requerem autenticação JWT.

---

## 🎯 Endpoints da Carteira Digital

### **Informações da Carteira**

#### Get My Wallet
**GET** `/billing/wallet`

**Permissões**: Apenas `CLIENT`

##### Response (200 OK)
```json
{
  "id": "cmezladn30008vbibcx54yuhf",
  "clientId": "cmezladmy0006vbibj6bfjeqg",
  "availableCredits": 900,
  "totalEarned": 2300,
  "totalSpent": 1400,
  "lastTransaction": "2025-09-12T21:53:50.130Z",
  "createdAt": "2025-08-31T11:10:35.151Z",
  "updatedAt": "2025-09-12T22:04:30.017Z",
  "client": {
    "id": "cmezladmy0006vbibj6bfjeqg",
    "userId": "cmezladmw0004vbib1n4hq6rm",
    "fullName": "Maria Oliveira",
    "personType": "BUSINESS",
    "taxDocument": "12.345.678/0001-90",
    "position": "cargo bão",
    "companyName": "Tech Solutions Ltda",
    "tradeName": "aoooba trem bão",
    "sector": "",
    "companySize": "MICRO",
    "website": "https://alougaleradecowboy.com",
    "phone": "+55 11 88888-0001",
    "street": "Av. Paulista, 1000",
    "city": "São Paulo",
    "state": "SP",
    "zipCode": "01310-000",
    "country": "Brasil",
    "createdAt": "2025-08-31T11:10:35.147Z",
    "updatedAt": "2025-09-11T11:52:09.939Z",
    "user": {
      "id": "cmezladmw0004vbib1n4hq6rm",
      "email": "cliente@empresa.com",
      "password": "$2b$12$6zffC3Et./7U0hWsE8y3NeyPjFufdAf7PqPix4UHB2UdrEL2ySGFK",
      "role": "CLIENT",
      "isActive": true,
      "profilePhoto": "/uploads/profile-photos/30043b77-f02e-420e-8526-716f4368f60f.png",
      "createdAt": "2025-08-31T11:10:35.145Z",
      "updatedAt": "2025-09-11T12:22:31.829Z"
    }
  }
}
```

**Nota**: Para informações sobre assinatura e uso mensal, utilize os endpoints `/billing/my-stats` e `/billing/subscriptions`.

#### Get Client Wallet (Admin/Employee)
**GET** `/billing/wallet/:clientId`

**Permissões**: `ADMIN` e `EMPLOYEE`

##### Response (200 OK)
```json
{
  "id": "wallet_123",
  "clientId": "client_456",
  "availableCredits": 1250,
  "totalEarned": 5000,
  "totalSpent": 3750,
  "lastTransaction": "2024-01-15T14:30:00.000Z",
  "client": {
    "user": {
      "email": "cliente@exemplo.com",
      "profilePhoto": "https://cdn.nerdzup.com/profile.jpg"
    },
    "companyName": "Tech Corp Ltda"
  }
}
```

---

## 💳 Pacotes de Créditos

### **Listar Pacotes Disponíveis**

#### Get Credit Packages
**GET** `/billing/credit-packages`

**Permissões**: Público

##### Query Parameters
```
includeInactive?: boolean = false  // Incluir pacotes inativos
```

##### Response (200 OK)
```json
[
  {
    "id": "pkg_123",
    "displayName": "Pacote Starter",
    "description": "Ideal para pequenos projetos",
    "credits": 100,
    "price": 99.99,
    "bonusCredits": 10,
    "isPopular": false,
    "features": [
      "100 créditos base",
      "10 créditos bônus",
      "Suporte por email"
    ],
    "isActive": true,
    "order": 1
  },
  {
    "id": "pkg_456",
    "displayName": "Pacote Business",
    "description": "Para empresas em crescimento",
    "credits": 500,
    "price": 399.99,
    "bonusCredits": 75,
    "isPopular": true,
    "features": [
      "500 créditos base",
      "75 créditos bônus",
      "Suporte prioritário",
      "Relatórios avançados"
    ],
    "isActive": true,
    "order": 2
  }
]
```

### **Comprar Pacote de Créditos**

#### Purchase Credit Package
**POST** `/billing/purchase/credits`

**Permissões**: Apenas `CLIENT`

##### Request Body
```json
{
  "packageId": "pkg_456",
  "paymentMethod": "CREDIT_CARD"
}
```

##### Response (200 OK)
```json
{
  "transaction": {
    "id": "txn_789",
    "clientId": "client_456",
    "type": "CREDIT_PURCHASE",
    "amount": 399.99,
    "credits": 575,  // 500 base + 75 bônus
    "description": "Purchase of Business Credit Package",
    "paymentMethod": "CREDIT_CARD",
    "status": "COMPLETED",
    "processedAt": "2024-01-15T15:00:00.000Z"
  },
  "wallet": {
    "availableCredits": 1825,  // Saldo anterior + novos créditos
    "totalEarned": 5575
  },
  "package": {
    "displayName": "Pacote Business",
    "credits": 500,
    "bonusCredits": 75
  }
}
```

---

## 📋 Planos de Assinatura

### **Listar Planos Disponíveis**

#### Get Subscription Plans
**GET** `/billing/subscription-plans`

**Permissões**: Público

##### Response (200 OK)
```json
[
  {
    "id": "plan_123",
    "displayName": "Plano Basic",
    "description": "Perfeito para freelancers",
    "monthlyPrice": 99.99,
    "annualPrice": 999.99,
    "monthlyCredits": 200,
    "benefits": [
      "200 créditos mensais",
      "Suporte por email",
      "Acesso a todos os serviços"
    ],
    "discountType": "PERCENTAGE",
    "discountValue": 15,  // 15% de desconto no anual
    "isPopular": false,
    "isActive": true,
    "order": 1
  },
  {
    "id": "plan_456",
    "displayName": "Plano Premium",
    "description": "Para empresas que precisam de mais",
    "monthlyPrice": 299.99,
    "annualPrice": 2999.99,
    "monthlyCredits": 500,
    "benefits": [
      "500 créditos mensais",
      "Suporte prioritário 24/7",
      "Gerente de conta dedicado",
      "Relatórios personalizados"
    ],
    "discountType": "PERCENTAGE",
    "discountValue": 20,  // 20% de desconto no anual
    "isPopular": true,
    "isActive": true,
    "order": 2
  }
]
```

### **Assinar um Plano**

#### Purchase Subscription
**POST** `/billing/purchase/subscription`

**Permissões**: Apenas `CLIENT`

##### Request Body
```json
{
  "planId": "plan_456",
  "isAnnual": false,
  "paymentMethod": "CREDIT_CARD"
}
```

##### Response (200 OK)
```json
{
  "subscription": {
    "id": "sub_890",
    "clientId": "client_456",
    "planId": "plan_456",
    "status": "ACTIVE",
    "isAnnual": false,
    "nextBillingDate": "2024-02-15T00:00:00.000Z",
    "startDate": "2024-01-15T15:30:00.000Z",
    "plan": {
      "displayName": "Plano Premium",
      "monthlyPrice": 299.99,
      "monthlyCredits": 500
    }
  },
  "transaction": {
    "amount": 299.99,
    "credits": 500,
    "description": "Subscription purchase: Plano Premium (Monthly)",
    "isUpgrade": false
  }
}
```

### **Gerenciar Assinatura**

#### Get My Subscriptions
**GET** `/billing/subscriptions`

**Permissões**: Apenas `CLIENT`

##### Response (200 OK)
```json
[
  {
    "id": "sub_890",
    "status": "ACTIVE",
    "isAnnual": false,
    "startDate": "2024-01-15T15:30:00.000Z",
    "nextBillingDate": "2024-02-15T00:00:00.000Z",
    "endDate": null,
    "plan": {
      "id": "plan_456",
      "displayName": "Plano Premium",
      "monthlyPrice": 299.99,
      "monthlyCredits": 500,
      "benefits": [
        "500 créditos mensais",
        "Suporte prioritário 24/7",
        "Gerente de conta dedicado"
      ]
    }
  }
]
```

#### Change Subscription Plan
**POST** `/billing/subscriptions/:id/change-plan`

**Permissões**: Apenas `CLIENT`

##### Request Body
```json
{
  "planId": "plan_789",  // Novo plano
  "isAnnual": true,
  "paymentMethod": "CREDIT_CARD"
}
```

##### Response (200 OK)
```json
{
  "subscription": {
    "id": "sub_901",
    "status": "ACTIVE",
    "isAnnual": true,
    "nextBillingDate": "2025-01-15T00:00:00.000Z",
    "plan": {
      "displayName": "Plano Enterprise",
      "annualPrice": 5999.99,
      "monthlyCredits": 1000
    }
  },
  "transaction": {
    "amount": 450.00,  // Diferença proporcional
    "credits": 750,    // Créditos ajustados
    "description": "Subscription change from Plano Premium to Plano Enterprise (Annual)",
    "isUpgrade": true
  }
}
```

#### Cancel Subscription
**POST** `/billing/subscriptions/:id/cancel`

**Permissões**: Apenas `CLIENT`

##### Response (200 OK)
```json
{
  "message": "Subscription cancelled successfully",
  "subscription": {
    "id": "sub_890",
    "status": "CANCELLED",
    "endDate": "2024-01-15T16:00:00.000Z",
    "plan": {
      "displayName": "Plano Premium"
    }
  },
  "refundInfo": {
    "remainingDays": 23,
    "refundAmount": 229.99,
    "refundCredits": 385
  }
}
```

---

## 📊 Histórico e Transações

### **Minhas Transações**

#### Get My Transaction History
**GET** `/billing/transactions/my`

**Permissões**: Apenas `CLIENT`

##### Query Parameters
```
type?: string              // Filtrar por tipo (CREDIT_PURCHASE, SUBSCRIPTION_PAYMENT, etc.)
status?: string            // Filtrar por status (COMPLETED, PENDING, FAILED)
paymentMethod?: string     // Filtrar por método de pagamento
page?: number = 1          // Página
limit?: number = 20        // Itens por página
```

##### Response (200 OK)
```json
{
  "transactions": [
    {
      "id": "txn_123",
      "type": "SUBSCRIPTION_PAYMENT",
      "amount": 299.99,
      "credits": 500,
      "description": "Monthly subscription: Plano Premium",
      "paymentMethod": "CREDIT_CARD",
      "status": "COMPLETED",
      "processedAt": "2024-01-15T15:30:00.000Z",
      "createdAt": "2024-01-15T15:30:00.000Z"
    },
    {
      "id": "txn_124",
      "type": "CREDIT_PURCHASE",
      "amount": 399.99,
      "credits": 575,
      "description": "Purchase of Business Credit Package",
      "paymentMethod": "PIX",
      "status": "COMPLETED",
      "processedAt": "2024-01-10T10:15:00.000Z",
      "createdAt": "2024-01-10T10:15:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 25,
    "totalPages": 2
  }
}
```

### **Estatísticas e Relatórios**

#### Get My Credit Stats
**GET** `/billing/my-stats`

**Permissões**: Apenas `CLIENT`

##### Response (200 OK)
```json
{
  "currentBalance": 1250,
  "totalEarned": 5000,
  "totalSpent": 3750,
  "thisMonth": {
    "creditsUsed": 125,
    "creditsEarned": 500,
    "servicesRequested": 8,
    "totalSpent": 1875
  },
  "lastMonth": {
    "creditsUsed": 450,
    "creditsEarned": 500,
    "servicesRequested": 22,
    "totalSpent": 6750
  },
  "currentSubscription": {
    "planName": "Plano Premium",
    "monthlyCredits": 500,
    "nextBillingDate": "2024-02-15T00:00:00.000Z",
    "daysUntilRenewal": 30,
    "status": "ACTIVE"
  }
}
```

#### Get My Usage This Month
**GET** `/billing/my-service-usage`

**Permissões**: Apenas `CLIENT`

##### Query Parameters
```
months?: number = 1  // Últimos X meses
```

##### Response (200 OK)
```json
{
  "period": {
    "startDate": "2024-01-01T00:00:00.000Z",
    "endDate": "2024-01-31T23:59:59.000Z",
    "months": 1
  },
  "summary": {
    "totalCreditsUsed": 125,
    "totalServicesRequested": 8,
    "averageCreditsPerService": 15.6,
    "mostUsedDay": "2024-01-15",
    "creditsUsedOnMostUsedDay": 45
  },
  "byService": [
    {
      "serviceId": "svc_123",
      "serviceName": "Website Development",
      "requestsCount": 3,
      "creditsUsed": 75,
      "averageCreditsPerRequest": 25
    },
    {
      "serviceId": "svc_456",
      "serviceName": "Logo Design",
      "requestsCount": 5,
      "creditsUsed": 50,
      "averageCreditsPerRequest": 10
    }
  ],
  "dailyUsage": [
    {
      "date": "2024-01-15",
      "creditsUsed": 45,
      "servicesRequested": 3
    },
    {
      "date": "2024-01-12",
      "creditsUsed": 25,
      "servicesRequested": 2
    }
  ]
}
```

#### Get My Usage Chart Data
**GET** `/billing/my-usage-chart`

**Permissões**: Apenas `CLIENT`

##### Query Parameters
```
months?: number = 6  // Últimos X meses
```

##### Response (200 OK)
```json
{
  "period": {
    "months": 6,
    "startDate": "2023-08-01T00:00:00.000Z",
    "endDate": "2024-01-31T23:59:59.000Z"
  },
  "monthlyData": [
    {
      "month": "2024-01",
      "creditsUsed": 125,
      "creditsEarned": 500,
      "servicesRequested": 8,
      "totalSpent": 0
    },
    {
      "month": "2023-12",
      "creditsUsed": 450,
      "creditsEarned": 500,
      "servicesRequested": 22,
      "totalSpent": 0
    },
    {
      "month": "2023-11",
      "creditsUsed": 380,
      "creditsEarned": 575,
      "servicesRequested": 18,
      "totalSpent": 399.99
    }
  ],
  "totals": {
    "creditsUsed": 2890,
    "creditsEarned": 3075,
    "servicesRequested": 145,
    "totalSpent": 1299.95
  }
}
```

---

## 🛠️ Administração (Admin/Employee)

### **Gerenciar Créditos de Clientes**

#### Update Client Credits (Admin Only)
**PATCH** `/billing/wallet/:clientId/credits`

**Permissões**: `ADMIN`

##### Request Body
```json
{
  "credits": 100,  // Pode ser positivo (adicionar) ou negativo (remover)
  "description": "Bonus credits for being a loyal customer"
}
```

##### Response (200 OK)
```json
{
  "wallet": {
    "id": "wallet_123",
    "clientId": "client_456",
    "availableCredits": 1350,  // Saldo atualizado
    "totalEarned": 5100,       // Total ganho atualizado
    "lastTransaction": "2024-01-15T16:30:00.000Z"
  },
  "transaction": {
    "id": "txn_125",
    "type": "ADMIN_ADJUSTMENT",
    "credits": 100,
    "description": "Bonus credits for being a loyal customer",
    "createdAt": "2024-01-15T16:30:00.000Z"
  }
}
```

### **Relatórios Administrativos**

#### Get Billing Statistics (Admin Only)
**GET** `/billing/stats`

**Permissões**: `ADMIN`

##### Response (200 OK)
```json
{
  "totalClients": 1250,
  "activeSubscriptions": 890,
  "totalRevenue": 125000.50,
  "creditsInCirculation": 285000,
  "thisMonth": {
    "newSubscriptions": 45,
    "cancelledSubscriptions": 12,
    "revenue": 15750.00,
    "creditsDistributed": 48500
  },
  "transactionsByType": {
    "SUBSCRIPTION_PAYMENT": {
      "count": 890,
      "revenue": 98500.50
    },
    "CREDIT_PURCHASE": {
      "count": 245,
      "revenue": 26500.00
    }
  }
}
```

---

## 🎨 Integração Frontend

### 1. Hook para Carteira (React)
```tsx
import { useState, useEffect } from 'react';

interface WalletData {
  availableCredits: number;
  totalEarned: number;
  totalSpent: number;
  currentSubscription?: {
    planName: string;
    nextBillingDate: string;
    status: string;
  };
  usageThisMonth: {
    creditsUsed: number;
    servicesRequested: number;
  };
}

export const useWallet = () => {
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchWallet = async () => {
    try {
      const response = await fetch('/api/billing/wallet', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      setWallet(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching wallet:', error);
      setLoading(false);
    }
  };

  const purchaseCredits = async (packageId: string, paymentMethod: string) => {
    try {
      const response = await fetch('/api/billing/purchase/credits', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ packageId, paymentMethod })
      });
      
      const result = await response.json();
      
      if (response.ok) {
        // Atualizar saldo local
        if (wallet) {
          setWallet({
            ...wallet,
            availableCredits: result.wallet.availableCredits,
            totalEarned: result.wallet.totalEarned
          });
        }
        return result;
      } else {
        throw new Error(result.message || 'Purchase failed');
      }
    } catch (error) {
      console.error('Error purchasing credits:', error);
      throw error;
    }
  };

  const purchaseSubscription = async (planId: string, isAnnual: boolean, paymentMethod: string) => {
    try {
      const response = await fetch('/api/billing/purchase/subscription', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ planId, isAnnual, paymentMethod })
      });
      
      const result = await response.json();
      
      if (response.ok) {
        // Recarregar dados da carteira
        await fetchWallet();
        return result;
      } else {
        throw new Error(result.message || 'Subscription purchase failed');
      }
    } catch (error) {
      console.error('Error purchasing subscription:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchWallet();
  }, []);

  return {
    wallet,
    loading,
    fetchWallet,
    purchaseCredits,
    purchaseSubscription
  };
};
```

### 2. Componente de Carteira
```tsx
import React from 'react';
import { useWallet } from './hooks/useWallet';

const WalletDashboard: React.FC = () => {
  const { wallet, loading } = useWallet();

  if (loading) return <div>Carregando carteira...</div>;
  if (!wallet) return <div>Erro ao carregar carteira</div>;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR');
  };

  return (
    <div className="wallet-dashboard">
      <div className="wallet-header">
        <h2>Minha Carteira</h2>
      </div>

      <div className="wallet-grid">
        {/* Saldo Atual */}
        <div className="wallet-card">
          <h3>Créditos Disponíveis</h3>
          <div className="credit-balance">{wallet.availableCredits}</div>
          <p className="text-muted">Créditos prontos para uso</p>
        </div>

        {/* Assinatura Atual */}
        {wallet.currentSubscription && (
          <div className="wallet-card">
            <h3>Assinatura Atual</h3>
            <div className="subscription-info">
              <p className="plan-name">{wallet.currentSubscription.planName}</p>
              <p className="next-billing">
                Próxima cobrança: {formatDate(wallet.currentSubscription.nextBillingDate)}
              </p>
              <span className={`status ${wallet.currentSubscription.status.toLowerCase()}`}>
                {wallet.currentSubscription.status}
              </span>
            </div>
          </div>
        )}

        {/* Uso Este Mês */}
        <div className="wallet-card">
          <h3>Uso Este Mês</h3>
          <div className="usage-stats">
            <div className="stat">
              <span className="value">{wallet.usageThisMonth.creditsUsed}</span>
              <span className="label">Créditos Utilizados</span>
            </div>
            <div className="stat">
              <span className="value">{wallet.usageThisMonth.servicesRequested}</span>
              <span className="label">Serviços Solicitados</span>
            </div>
          </div>
        </div>

        {/* Histórico */}
        <div className="wallet-card">
          <h3>Histórico</h3>
          <div className="history-summary">
            <div className="stat">
              <span className="value">{wallet.totalEarned}</span>
              <span className="label">Total Ganho</span>
            </div>
            <div className="stat">
              <span className="value">{wallet.totalSpent}</span>
              <span className="label">Total Gasto</span>
            </div>
          </div>
        </div>
      </div>

      {/* Ações Rápidas */}
      <div className="wallet-actions">
        <button className="btn btn-primary" onClick={() => window.location.href = '/billing/packages'}>
          Comprar Créditos
        </button>
        <button className="btn btn-secondary" onClick={() => window.location.href = '/billing/plans'}>
          Gerenciar Assinatura
        </button>
        <button className="btn btn-outline" onClick={() => window.location.href = '/billing/history'}>
          Ver Histórico Completo
        </button>
      </div>
    </div>
  );
};

export default WalletDashboard;
```

---

## 🔧 Próximos Passos

1. **Integração com Gateway de Pagamento**: Conectar com Stripe, PagSeguro, etc.
2. **Webhooks**: Implementar webhooks para atualizações de status de pagamento
3. **Faturas**: Sistema de geração de faturas em PDF
4. **Notificações**: Alertas para renovação, créditos baixos, etc.
5. **Relatórios Avançados**: Dashboard com gráficos e métricas detalhadas
6. **Cupons de Desconto**: Sistema de cupons e promoções
7. **Limites de Uso**: Controles de limite por cliente/plano

---

## 📝 Notas Técnicas

- Todos os preços são armazenados como `Decimal` no banco para precisão
- Transações são atômicas usando `$transaction` do Prisma
- Cálculos proporcionais para mudanças de plano consideram dias restantes
- Sistema suporta tanto pagamentos mensais quanto anuais
- Créditos bônus são aplicados automaticamente na compra de pacotes
- Histórico completo de todas as transações é mantido para auditoria
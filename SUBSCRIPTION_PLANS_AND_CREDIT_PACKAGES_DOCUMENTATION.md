# 💳 Subscription Plans and Credit Packages Documentation

## 📖 Overview

Este documento descreve o sistema completo de planos de assinatura e pacotes de crédito. O sistema permite que administradores criem e gerenciem planos de assinatura mensais e pacotes de créditos avulsos, enquanto clientes podem visualizar e adquirir esses produtos.

---

## 🎯 Admin Endpoints (CRUD)

### 📋 Subscription Plans Management

#### 1. Create Subscription Plan
**POST** `/billing/subscription-plans`

**Permissões**: Apenas `ADMIN`

##### Request Body
```json
{
  "name": "premium",
  "displayName": "Plano Premium",
  "description": "Plano completo para empresas estabelecidas",
  "monthlyCredits": 2000,
  "monthlyPrice": 899.99,
  "annualPrice": 9599.99,
  "discountType": "PERCENTAGE",
  "discountValue": 11.11,
  "benefits": [
    "2000 créditos mensais",
    "Suporte via telefone e chat",
    "Relatórios detalhados",
    "Consultoria estratégica",
    "Acesso prioritário"
  ],
  "isPopular": true,
  "order": 1
}
```

##### Request Body Fields
- `name` (string, required) - Nome único do plano (usado internamente)
- `displayName` (string, required) - Nome para exibição
- `description` (string, optional) - Descrição do plano
- `monthlyCredits` (number, required) - Quantidade de créditos mensais
- `monthlyPrice` (number, required) - Preço mensal em BRL
- `annualPrice` (number, optional) - Preço anual em BRL
- `discountType` (enum, optional) - Tipo de desconto: "PERCENTAGE" ou "VALUE"
- `discountValue` (number, optional) - Valor do desconto (% ou valor fixo em BRL)
- `benefits` (array, optional) - Lista de benefícios inclusos
- `isPopular` (boolean, optional) - Se é um plano popular/destacado (default: false)
- `order` (number, optional) - Ordem de exibição (default: 0)

##### Response (201 Created)
```json
{
  "id": "plan_123",
  "name": "premium",
  "displayName": "Plano Premium",
  "description": "Plano completo para empresas estabelecidas",
  "monthlyCredits": 2000,
  "monthlyPrice": 899.99,
  "annualPrice": 9599.99,
  "discountType": "PERCENTAGE",
  "discountValue": 11.11,
  "isActive": true,
  "isPopular": true,
  "benefits": [
    "2000 créditos mensais",
    "Suporte via telefone e chat",
    "Relatórios detalhados",
    "Consultoria estratégica",
    "Acesso prioritário"
  ],
  "order": 1,
  "createdAt": "2024-01-15T10:00:00.000Z",
  "updatedAt": "2024-01-15T10:00:00.000Z"
}
```

#### 2. Get All Subscription Plans (Admin)
**GET** `/billing/subscription-plans?includeInactive=true`

**Permissões**: Todos os usuários autenticados

##### Query Parameters
- `includeInactive` (string, optional) - "true" para incluir planos inativos

##### Response
```json
[
  {
    "id": "plan_123",
    "name": "premium",
    "displayName": "Plano Premium",
    "description": "Plano completo para empresas estabelecidas",
    "monthlyCredits": 2000,
    "monthlyPrice": 899.99,
    "annualPrice": 9599.99,
    "discountType": "PERCENTAGE",
    "discountValue": 11.11,
    "isActive": true,
    "isPopular": true,
    "benefits": [
      "2000 créditos mensais",
      "Suporte via telefone e chat",
      "Relatórios detalhados",
      "Consultoria estratégica"
    ],
    "order": 1,
    "createdAt": "2024-01-15T10:00:00.000Z",
    "updatedAt": "2024-01-15T10:00:00.000Z"
  },
  {
    "id": "plan_456",
    "name": "basico",
    "displayName": "Plano Básico",
    "description": "Ideal para pequenas empresas que estão começando",
    "monthlyCredits": 500,
    "monthlyPrice": 299.99,
    "annualPrice": 3199.99,
    "discountType": "VALUE",
    "discountValue": 400.00,
    "isActive": true,
    "isPopular": false,
    "benefits": [
      "500 créditos mensais",
      "Suporte via email",
      "Relatórios mensais"
    ],
    "order": 2,
    "createdAt": "2024-01-15T10:00:00.000Z",
    "updatedAt": "2024-01-15T10:00:00.000Z"
  }
]
```

#### 3. Get Single Subscription Plan
**GET** `/billing/subscription-plans/:id`

**Permissões**: Apenas `ADMIN`

##### Response
```json
{
  "id": "plan_123",
  "name": "premium",
  "displayName": "Plano Premium",
  "description": "Plano completo para empresas estabelecidas",
  "monthlyCredits": 2000,
  "monthlyPrice": 899.99,
  "annualPrice": 9599.99,
  "discountType": "PERCENTAGE",
  "discountValue": 11.11,
  "isActive": true,
  "isPopular": true,
  "benefits": [
    "2000 créditos mensais",
    "Suporte via telefone e chat",
    "Relatórios detalhados",
    "Consultoria estratégica"
  ],
  "order": 1,
  "createdAt": "2024-01-15T10:00:00.000Z",
  "updatedAt": "2024-01-15T10:00:00.000Z",
  "subscriptions": [
    {
      "id": "sub_456",
      "status": "ACTIVE",
      "client": {
        "fullName": "João Silva",
        "user": {
          "email": "joao@email.com"
        }
      }
    }
  ]
}
```

#### 4. Update Subscription Plan
**PATCH** `/billing/subscription-plans/:id`

**Permissões**: Apenas `ADMIN`

##### Request Body
```json
{
  "displayName": "Plano Premium Plus",
  "description": "Plano completo com benefícios premium",
  "monthlyCredits": 2500,
  "monthlyPrice": 999.99,
  "annualPrice": 10799.99,
  "discountType": "PERCENTAGE",
  "discountValue": 15.0,
  "isActive": true,
  "isPopular": false,
  "benefits": [
    "2500 créditos mensais",
    "Suporte 24/7",
    "Relatórios em tempo real"
  ],
  "order": 1
}
```

##### Request Body Fields (Update)
- `displayName` (string, optional) - Nome para exibição
- `description` (string, optional) - Descrição do plano
- `monthlyCredits` (number, optional) - Quantidade de créditos mensais
- `monthlyPrice` (number, optional) - Preço mensal em BRL
- `annualPrice` (number, optional) - Preço anual em BRL
- `discountType` (enum, optional) - Tipo de desconto: "PERCENTAGE" ou "VALUE"
- `discountValue` (number, optional) - Valor do desconto (% ou valor fixo em BRL)
- `isActive` (boolean, optional) - Se o plano está ativo
- `isPopular` (boolean, optional) - Se é um plano popular/destacado
- `benefits` (array, optional) - Lista de benefícios inclusos
- `order` (number, optional) - Ordem de exibição

**Nota**: O campo `name` (identificador único) não pode ser alterado após a criação do plano.

##### Response
```json
{
  "id": "plan_123",
  "name": "premium",
  "displayName": "Plano Premium Plus",
  "monthlyPrice": 999.99,
  "isPopular": false,
  "updatedAt": "2024-01-16T14:30:00.000Z"
}
```

#### 5. Delete Subscription Plan
**DELETE** `/billing/subscription-plans/:id`

**Permissões**: Apenas `ADMIN`

##### Response
```
204 No Content
```

---

### 💎 Credit Packages Management

#### 1. Create Credit Package
**POST** `/billing/credit-packages`

**Permissões**: Apenas `ADMIN`

##### Request Body
```json
{
  "name": "mega_pack",
  "displayName": "Mega Pack",
  "description": "Pacote ideal para projetos grandes com bônus especial",
  "credits": 5000,
  "price": 1999.99,
  "bonusCredits": 1000,
  "isPopular": true,
  "order": 1
}
```

##### Request Body Fields
- `name` (string, required) - Nome único do pacote
- `displayName` (string, required) - Nome para exibição
- `description` (string, optional) - Descrição do pacote
- `credits` (number, required) - Quantidade de créditos
- `price` (number, required) - Preço em BRL
- `bonusCredits` (number, optional) - Créditos bônus (default: 0)
- `isPopular` (boolean, optional) - Se é um pacote popular/destacado (default: false)
- `order` (number, optional) - Ordem de exibição (default: 0)

##### Response (201 Created)
```json
{
  "id": "package_789",
  "name": "mega_pack",
  "displayName": "Mega Pack",
  "description": "Pacote ideal para projetos grandes com bônus especial",
  "credits": 5000,
  "price": 1999.99,
  "bonusCredits": 1000,
  "isActive": true,
  "isPopular": true,
  "order": 1,
  "createdAt": "2024-01-15T11:00:00.000Z",
  "updatedAt": "2024-01-15T11:00:00.000Z"
}
```

#### 2. Get All Credit Packages
**GET** `/billing/credit-packages?includeInactive=true`

**Permissões**: Todos os usuários autenticados

##### Query Parameters
- `includeInactive` (string, optional) - "true" para incluir pacotes inativos

##### Response
```json
[
  {
    "id": "package_789",
    "name": "mega_pack",
    "displayName": "Mega Pack",
    "description": "Pacote ideal para projetos grandes",
    "credits": 5000,
    "price": 1999.99,
    "bonusCredits": 1000,
    "isActive": true,
    "isPopular": true,
    "order": 1,
    "createdAt": "2024-01-15T11:00:00.000Z",
    "updatedAt": "2024-01-15T11:00:00.000Z"
  }
]
```

#### 3. Get Single Credit Package
**GET** `/billing/credit-packages/:id`

**Permissões**: Todos os usuários autenticados

##### Response
```json
{
  "id": "package_789",
  "name": "mega_pack",
  "displayName": "Mega Pack",
  "description": "Pacote ideal para projetos grandes",
  "credits": 5000,
  "price": 1999.99,
  "bonusCredits": 1000,
  "isActive": true,
  "isPopular": true,
  "order": 1,
  "createdAt": "2024-01-15T11:00:00.000Z",
  "updatedAt": "2024-01-15T11:00:00.000Z"
}
```

#### 4. Update Credit Package
**PATCH** `/billing/credit-packages/:id`

**Permissões**: Apenas `ADMIN`

##### Request Body
```json
{
  "displayName": "Super Mega Pack",
  "price": 1799.99,
  "bonusCredits": 1500,
  "isPopular": false
}
```

##### Response
```json
{
  "id": "package_789",
  "displayName": "Super Mega Pack",
  "price": 1799.99,
  "bonusCredits": 1500,
  "isPopular": false,
  "updatedAt": "2024-01-16T15:45:00.000Z"
}
```

#### 5. Delete Credit Package
**DELETE** `/billing/credit-packages/:id`

**Permissões**: Apenas `ADMIN`

##### Response
```
204 No Content
```

---

## 👥 Client Endpoints (View Only)

### 📋 View Available Subscription Plans
**GET** `/billing/subscription-plans`

**Permissões**: Todos os usuários autenticados (CLIENT, EMPLOYEE, ADMIN)

##### Response
```json
[
  {
    "id": "plan_123",
    "name": "premium",
    "displayName": "Plano Premium",
    "description": "Plano completo para empresas estabelecidas",
    "monthlyCredits": 2000,
    "monthlyPrice": 899.99,
    "annualPrice": 9599.99,
    "discountType": "PERCENTAGE",
    "discountValue": 11.11,
    "isActive": true,
    "isPopular": true,
    "benefits": [
      "2000 créditos mensais",
      "Suporte via telefone e chat",
      "Relatórios detalhados",
      "Consultoria estratégica"
    ],
    "order": 1
  },
  {
    "id": "plan_456",
    "name": "basico",
    "displayName": "Plano Básico",
    "description": "Ideal para pequenas empresas que estão começando",
    "monthlyCredits": 500,
    "monthlyPrice": 299.99,
    "annualPrice": 3199.99,
    "discountType": "VALUE",
    "discountValue": 400.00,
    "isActive": true,
    "isPopular": false,
    "benefits": [
      "500 créditos mensais",
      "Suporte via email",
      "Relatórios mensais"
    ],
    "order": 2
  }
]
```

### 💎 View Available Credit Packages
**GET** `/billing/credit-packages`

**Permissões**: Todos os usuários autenticados (CLIENT, EMPLOYEE, ADMIN)

##### Response
```json
[
  {
    "id": "package_789",
    "name": "mega_pack",
    "displayName": "Mega Pack",
    "description": "Pacote ideal para projetos grandes com bônus especial",
    "credits": 5000,
    "price": 1999.99,
    "bonusCredits": 1000,
    "isActive": true,
    "isPopular": true,
    "order": 1
  },
  {
    "id": "package_101",
    "name": "starter_pack",
    "displayName": "Starter Pack",
    "description": "Pacote inicial para começar seus projetos",
    "credits": 1000,
    "price": 399.99,
    "bonusCredits": 100,
    "isActive": true,
    "isPopular": false,
    "order": 2
  }
]
```

---

## 💰 Sistema de Preços e Descontos

### Tipos de Desconto

#### 1. Desconto Percentual
```json
{
  "discountType": "PERCENTAGE",
  "discountValue": 15.5
}
```
- Aplica um desconto percentual sobre o preço anual
- Exemplo: 15.5% de desconto no plano anual
- O valor é subtraído diretamente do preço anual

#### 2. Desconto por Valor Fixo
```json
{
  "discountType": "VALUE",
  "discountValue": 1200.00
}
```
- Aplica um desconto em valor fixo (BRL) sobre o preço anual
- Exemplo: R$ 1.200,00 de desconto no plano anual
- Valor em reais subtraído do preço anual

### Como Calcular Preços com Desconto

#### Fórmulas de Cálculo
```javascript
// Função para calcular preços com desconto anual
const calcularPrecoComDesconto = (plano) => {
  const precoMensalTotal = plano.monthlyPrice * 12;
  
  if (!plano.annualPrice) {
    return { 
      temDesconto: false,
      precoAnualFinal: 0,
      economia: 0,
      percentualEconomia: 0 
    };
  }
  
  let precoAnualFinal = plano.annualPrice;
  
  // Aplicar desconto conforme o tipo
  if (plano.discountType && plano.discountValue) {
    if (plano.discountType === 'PERCENTAGE') {
      // Desconto percentual: preço * (1 - desconto/100)
      precoAnualFinal = plano.annualPrice * (1 - plano.discountValue / 100);
    } else if (plano.discountType === 'VALUE') {
      // Desconto fixo: preço - valor do desconto
      precoAnualFinal = plano.annualPrice - plano.discountValue;
    }
  }
  
  const economia = precoMensalTotal - precoAnualFinal;
  const percentualEconomia = (economia / precoMensalTotal) * 100;
  
  return {
    precoMensalTotal,
    precoAnualOriginal: plano.annualPrice,
    precoAnualFinal,
    economia: Math.max(0, economia),
    percentualEconomia: Math.max(0, Math.round(percentualEconomia * 100) / 100),
    temDesconto: economia > 0
  };
};

// Exemplo prático de uso
const planoExemplo = {
  displayName: "Plano Premium",
  monthlyPrice: 899.99,      // R$ 899,99/mês
  annualPrice: 9599.99,      // R$ 9.599,99/ano (sem desconto)
  discountType: 'PERCENTAGE', // Tipo: desconto percentual
  discountValue: 11.11       // 11.11% de desconto
};

const resultado = calcularPrecoComDesconto(planoExemplo);
console.log(resultado);
/* Resultado:
{
  precoMensalTotal: 10799.88,    // 899.99 * 12 meses
  precoAnualOriginal: 9599.99,   // Preço original anual
  precoAnualFinal: 8532.89,      // 9599.99 * (1 - 11.11/100)
  economia: 2266.99,             // 10799.88 - 8532.89
  percentualEconomia: 21.0,      // Economia total em %
  temDesconto: true
}
*/
```

### Exemplos de Implementação Frontend

#### Badge de Desconto
```tsx
const BadgeDesconto = ({ plano }) => {
  if (!plano.discountType || !plano.discountValue) return null;
  
  return (
    <div className="badge-desconto">
      {plano.discountType === 'PERCENTAGE' ? (
        <span>{plano.discountValue}% OFF</span>
      ) : (
        <span>-R$ {plano.discountValue.toLocaleString('pt-BR', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        })}</span>
      )}
    </div>
  );
};
```

#### Calculadora de Economia
```tsx
const ExibicaoEconomia = ({ plano }) => {
  const calculo = calcularPrecoComDesconto(plano);
  
  if (!calculo.temDesconto) return null;
  
  return (
    <div className="economia-info">
      <div className="valor-economia">
        Economia anual: R$ {calculo.economia.toLocaleString('pt-BR', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        })}
      </div>
      <div className="percentual-economia">
        ({calculo.percentualEconomia}% de desconto total)
      </div>
      <div className="comparacao-precos">
        <span className="preco-mensal">
          12x R$ {plano.monthlyPrice.toFixed(2)} = R$ {calculo.precoMensalTotal.toFixed(2)}
        </span>
        <span className="preco-anual">
          Anual: R$ {calculo.precoAnualFinal.toFixed(2)}
        </span>
      </div>
    </div>
  );
};
```

### Estratégias de Desconto Recomendadas

#### Para Planos Premium
```json
{
  "discountType": "PERCENTAGE",
  "discountValue": 16.67,
  "comentario": "Equivale a 2 meses grátis (10 meses pagos)"
}
```

#### Para Planos Básicos
```json
{
  "discountType": "VALUE", 
  "discountValue": 600.00,
  "comentario": "Desconto fixo atrativo para clientes iniciantes"
}
```

#### Para Promoções Especiais
```json
{
  "discountType": "PERCENTAGE",
  "discountValue": 25.0,
  "comentario": "25% OFF para Black Friday ou campanhas especiais"
}
```

---

## 🎨 Frontend Integration Examples

### 1. Enhanced Subscription Plans Component (React)
```tsx
import { useState, useEffect } from 'react';

interface SubscriptionPlan {
  id: string;
  displayName: string;
  description?: string;
  monthlyCredits: number;
  monthlyPrice: number;
  annualPrice?: number;
  discountType?: 'PERCENTAGE' | 'VALUE';
  discountValue?: number;
  isPopular: boolean;
  benefits: string[];
}

const SubscriptionPlans = () => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await fetch('/api/billing/subscription-plans', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) throw new Error('Failed to fetch plans');
        
        const data = await response.json();
        setPlans(data);
      } catch (error) {
        console.error('Error fetching subscription plans:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  const calculatePricing = (plan: SubscriptionPlan) => {
    if (billingCycle === 'monthly' || !plan.annualPrice) {
      return {
        price: plan.monthlyPrice,
        period: '/mês',
        savings: 0,
        discountPercentage: 0
      };
    }
    
    const monthlyTotal = plan.monthlyPrice * 12;
    let finalAnnualPrice = plan.annualPrice;
    
    // Apply discount if exists
    if (plan.discountType && plan.discountValue) {
      if (plan.discountType === 'PERCENTAGE') {
        finalAnnualPrice = plan.annualPrice * (1 - plan.discountValue / 100);
      } else if (plan.discountType === 'VALUE') {
        finalAnnualPrice = plan.annualPrice - plan.discountValue;
      }
    }
    
    const savings = monthlyTotal - finalAnnualPrice;
    const discountPercentage = (savings / monthlyTotal) * 100;
    
    return {
      price: finalAnnualPrice / 12, // Monthly equivalent
      originalAnnualPrice: plan.annualPrice,
      finalAnnualPrice,
      period: '/mês (cobrado anualmente)',
      savings,
      discountPercentage: Math.round(discountPercentage * 100) / 100
    };
  };

  if (loading) return <div>Carregando planos...</div>;

  return (
    <div className="subscription-plans">
      <h2>Escolha seu Plano</h2>
      
      {/* Billing Cycle Toggle */}
      <div className="billing-toggle">
        <button 
          className={billingCycle === 'monthly' ? 'active' : ''}
          onClick={() => setBillingCycle('monthly')}
        >
          Mensal
        </button>
        <button 
          className={billingCycle === 'annual' ? 'active' : ''}
          onClick={() => setBillingCycle('annual')}
        >
          Anual
          {plans.some(p => p.annualPrice) && (
            <span className="save-badge">Economize até 25%</span>
          )}
        </button>
      </div>
      
      <div className="plans-grid">
        {plans.map((plan) => {
          const pricing = calculatePricing(plan);
          
          return (
            <div 
              key={plan.id} 
              className={`plan-card ${plan.isPopular ? 'popular' : ''}`}
            >
              {plan.isPopular && <div className="popular-badge">Mais Popular</div>}
              
              {/* Discount Badge */}
              {billingCycle === 'annual' && plan.discountType && plan.discountValue && (
                <div className="discount-badge">
                  {plan.discountType === 'PERCENTAGE' ? (
                    <span>{plan.discountValue}% OFF</span>
                  ) : (
                    <span>-R$ {plan.discountValue.toFixed(2)}</span>
                  )}
                </div>
              )}
              
              <h3>{plan.displayName}</h3>
              <p className="description">{plan.description}</p>
              
              <div className="pricing-section">
                <div className="price">
                  <span className="currency">R$</span>
                  <span className="amount">{pricing.price.toFixed(2)}</span>
                  <span className="period">{pricing.period}</span>
                </div>
                
                {billingCycle === 'annual' && pricing.savings > 0 && (
                  <div className="savings-info">
                    <div className="annual-total">
                      Total anual: R$ {pricing.finalAnnualPrice.toFixed(2)}
                    </div>
                    <div className="savings">
                      Economia: R$ {pricing.savings.toFixed(2)} ({pricing.discountPercentage}%)
                    </div>
                  </div>
                )}
              </div>
              
              <div className="credits">
                {plan.monthlyCredits.toLocaleString()} créditos mensais
              </div>
              
              <ul className="benefits">
                {plan.benefits.map((benefit, index) => (
                  <li key={index}>{benefit}</li>
                ))}
              </ul>
              
              <button 
                className="select-plan-btn"
                onClick={() => handleSelectPlan(plan.id, billingCycle)}
              >
                Escolher Plano
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const handleSelectPlan = (planId: string, billingCycle: 'monthly' | 'annual') => {
  // Implementar lógica de seleção do plano
  console.log('Selected plan:', planId, 'Billing cycle:', billingCycle);
};

export default SubscriptionPlans;
```

### 2. Credit Packages Component (React)
```tsx
import { useState, useEffect } from 'react';

interface CreditPackage {
  id: string;
  displayName: string;
  description?: string;
  credits: number;
  price: number;
  bonusCredits: number;
  isPopular: boolean;
}

const CreditPackages = () => {
  const [packages, setPackages] = useState<CreditPackage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const response = await fetch('/api/billing/credit-packages', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        });
        
        const data = await response.json();
        setPackages(data);
      } catch (error) {
        console.error('Error fetching credit packages:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPackages();
  }, []);

  const calculateTotalCredits = (credits: number, bonusCredits: number) => {
    return credits + bonusCredits;
  };

  const calculatePricePerCredit = (price: number, totalCredits: number) => {
    return (price / totalCredits).toFixed(2);
  };

  if (loading) return <div>Carregando pacotes...</div>;

  return (
    <div className="credit-packages">
      <h2>Pacotes de Créditos</h2>
      <div className="packages-grid">
        {packages.map((pkg) => {
          const totalCredits = calculateTotalCredits(pkg.credits, pkg.bonusCredits);
          const pricePerCredit = calculatePricePerCredit(pkg.price, totalCredits);
          
          return (
            <div 
              key={pkg.id} 
              className={`package-card ${pkg.isPopular ? 'popular' : ''}`}
            >
              {pkg.isPopular && <div className="popular-badge">Melhor Oferta</div>}
              
              <h3>{pkg.displayName}</h3>
              <p className="description">{pkg.description}</p>
              
              <div className="price">
                <span className="currency">R$</span>
                <span className="amount">{pkg.price.toFixed(2)}</span>
              </div>
              
              <div className="credits-info">
                <div className="main-credits">
                  {pkg.credits.toLocaleString()} créditos
                </div>
                
                {pkg.bonusCredits > 0 && (
                  <div className="bonus-credits">
                    + {pkg.bonusCredits.toLocaleString()} créditos bônus
                  </div>
                )}
                
                <div className="total-credits">
                  Total: {totalCredits.toLocaleString()} créditos
                </div>
                
                <div className="price-per-credit">
                  R$ {pricePerCredit} por crédito
                </div>
              </div>
              
              <button 
                className="buy-package-btn"
                onClick={() => handleBuyPackage(pkg.id)}
              >
                Comprar Pacote
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const handleBuyPackage = (packageId: string) => {
  // Implementar lógica de compra do pacote
  console.log('Buy package:', packageId);
};

export default CreditPackages;
```

### 3. Admin Management Hook (React)
```tsx
import { useState, useCallback } from 'react';

interface AdminBillingHook {
  createPlan: (planData: any) => Promise<any>;
  updatePlan: (id: string, planData: any) => Promise<any>;
  deletePlan: (id: string) => Promise<boolean>;
  createPackage: (packageData: any) => Promise<any>;
  updatePackage: (id: string, packageData: any) => Promise<any>;
  deletePackage: (id: string) => Promise<boolean>;
  loading: boolean;
  error: string | null;
}

export const useAdminBilling = (): AdminBillingHook => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apiCall = useCallback(async (url: string, options: RequestInit) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
          'Content-Type': 'application/json',
          ...options.headers
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return response.status !== 204 ? await response.json() : null;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createPlan = useCallback(async (planData: any) => {
    return apiCall('/api/billing/subscription-plans', {
      method: 'POST',
      body: JSON.stringify(planData)
    });
  }, [apiCall]);

  const updatePlan = useCallback(async (id: string, planData: any) => {
    return apiCall(`/api/billing/subscription-plans/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(planData)
    });
  }, [apiCall]);

  const deletePlan = useCallback(async (id: string) => {
    await apiCall(`/api/billing/subscription-plans/${id}`, {
      method: 'DELETE'
    });
    return true;
  }, [apiCall]);

  const createPackage = useCallback(async (packageData: any) => {
    return apiCall('/api/billing/credit-packages', {
      method: 'POST',
      body: JSON.stringify(packageData)
    });
  }, [apiCall]);

  const updatePackage = useCallback(async (id: string, packageData: any) => {
    return apiCall(`/api/billing/credit-packages/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(packageData)
    });
  }, [apiCall]);

  const deletePackage = useCallback(async (id: string) => {
    await apiCall(`/api/billing/credit-packages/${id}`, {
      method: 'DELETE'
    });
    return true;
  }, [apiCall]);

  return {
    createPlan,
    updatePlan,
    deletePlan,
    createPackage,
    updatePackage,
    deletePackage,
    loading,
    error
  };
};
```

### 4. Vue.js Composable
```typescript
import { ref, computed } from 'vue';

interface Plan {
  id: string;
  displayName: string;
  monthlyPrice: number;
  monthlyCredits: number;
  isPopular: boolean;
  benefits: string[];
}

interface Package {
  id: string;
  displayName: string;
  price: number;
  credits: number;
  bonusCredits: number;
  isPopular: boolean;
}

export function useBilling() {
  const plans = ref<Plan[]>([]);
  const packages = ref<Package[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const popularPlan = computed(() => 
    plans.value.find(plan => plan.isPopular)
  );

  const popularPackage = computed(() => 
    packages.value.find(pkg => pkg.isPopular)
  );

  const sortedPlans = computed(() => 
    [...plans.value].sort((a, b) => a.monthlyPrice - b.monthlyPrice)
  );

  const fetchPlans = async () => {
    loading.value = true;
    try {
      const response = await fetch('/api/billing/subscription-plans');
      plans.value = await response.json();
    } catch (err) {
      error.value = 'Failed to fetch subscription plans';
    } finally {
      loading.value = false;
    }
  };

  const fetchPackages = async () => {
    loading.value = true;
    try {
      const response = await fetch('/api/billing/credit-packages');
      packages.value = await response.json();
    } catch (err) {
      error.value = 'Failed to fetch credit packages';
    } finally {
      loading.value = false;
    }
  };

  return {
    plans,
    packages,
    loading,
    error,
    popularPlan,
    popularPackage,
    sortedPlans,
    fetchPlans,
    fetchPackages
  };
}
```

---

## 🔐 Authentication & Permissions

### Required Headers
```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

### Permission Levels

#### ADMIN
- **Create**: Planos e pacotes
- **Read**: Todos os detalhes (incluindo inativos)
- **Update**: Planos e pacotes
- **Delete**: Planos e pacotes

#### CLIENT/EMPLOYEE
- **Read**: Apenas planos e pacotes ativos (para visualização)

---

## 🎯 Business Logic & Features

### Subscription Plans
- **Monthly Billing**: Cobrança recorrente mensal
- **Credit Allocation**: Créditos são adicionados mensalmente à wallet
- **Benefits**: Lista de benefícios inclusos
- **Popular Flag**: Destaca planos recomendados
- **Active Status**: Controla visibilidade para clientes

### Credit Packages
- **One-time Purchase**: Compra única de créditos
- **Bonus System**: Créditos extras como incentivo
- **Immediate Credit**: Créditos são adicionados imediatamente à wallet
- **Popular Flag**: Destaca melhores ofertas
- **Price per Credit**: Transparência no custo por crédito

### Popular Flag Usage
```tsx
// Destaque visual para planos/pacotes populares
const PlanCard = ({ plan }) => (
  <div className={`plan-card ${plan.isPopular ? 'popular' : ''}`}>
    {plan.isPopular && (
      <div className="popular-badge">
        <span>Mais Popular</span>
      </div>
    )}
    {/* resto do card */}
  </div>
);
```

### Benefits Display
```tsx
// Exibição de benefícios
const BenefitsList = ({ benefits }) => (
  <ul className="benefits-list">
    {benefits.map((benefit, index) => (
      <li key={index} className="benefit-item">
        <CheckIcon />
        <span>{benefit}</span>
      </li>
    ))}
  </ul>
);
```

---

## 📊 Data Formatting Examples

### Price Formatting
```javascript
const formatPrice = (price) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(price);
};

// Usage: formatPrice(899.99) → "R$ 899,99"
```

### Credits Formatting
```javascript
const formatCredits = (credits) => {
  return credits.toLocaleString('pt-BR');
};

// Usage: formatCredits(5000) → "5.000"
```

---

## 🧪 Testing Examples

### Using cURL

#### Create Subscription Plan
```bash
curl -X POST "http://localhost:4000/billing/subscription-plans" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "premium",
    "displayName": "Plano Premium",
    "description": "Plano completo para empresas",
    "monthlyCredits": 2000,
    "monthlyPrice": 899.99,
    "benefits": ["2000 créditos mensais", "Suporte prioritário"],
    "isPopular": true
  }'
```

#### Get Plans (Client View)
```bash
curl -X GET "http://localhost:4000/billing/subscription-plans" \
  -H "Authorization: Bearer YOUR_CLIENT_TOKEN"
```

#### Create Credit Package
```bash
curl -X POST "http://localhost:4000/billing/credit-packages" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "mega_pack",
    "displayName": "Mega Pack",
    "description": "Pacote com bônus especial",
    "credits": 5000,
    "price": 1999.99,
    "bonusCredits": 1000,
    "isPopular": true
  }'
```

---

## 💡 Best Practices

### 1. Plan Design
- Use meaningful names and descriptions
- Set realistic credit amounts
- Price competitively
- Highlight key benefits
- Use popular flag strategically

### 2. Package Strategy
- Offer bonus credits for larger packages
- Create clear value propositions
- Use attractive pricing tiers
- Mark best-value packages as popular

### 3. Frontend Integration
- Show price per credit for transparency
- Use visual indicators for popular items
- Implement proper loading states
- Handle errors gracefully
- Cache plan data when appropriate

### 4. Admin Management
- Validate price changes carefully
- Consider existing subscribers when updating plans
- Use soft delete (isActive: false) instead of hard delete
- Monitor plan performance metrics

---

## 🛒 Client Purchase Endpoints

### 📋 Purchase Subscription Plan
**POST** `/billing/purchase/subscription`

**Permissões**: Apenas `CLIENT`

Este endpoint permite que clientes assinem planos mensais ou anuais. Se o cliente já possui uma assinatura ativa, o sistema calculará automaticamente:
- Diferença de preço (com reembolso proporcional)
- Diferença de créditos baseada no tempo restante
- Aplicação de descontos para planos anuais

##### Request Body
```json
{
  "planId": "plan_123",
  "isAnnual": true,
  "paymentMethod": "CREDIT_CARD"
}
```

##### Request Body Fields
- `planId` (string, required) - ID do plano de assinatura
- `isAnnual` (boolean, optional) - true para cobrança anual, false para mensal (default: false)
- `paymentMethod` (enum, required) - Método de pagamento: "CREDIT_CARD", "PIX", "BOLETO"

##### Response (200 OK) - Nova Assinatura
```json
{
  "subscription": {
    "id": "sub_789",
    "clientId": "client_456",
    "planId": "plan_123",
    "status": "ACTIVE",
    "isAnnual": true,
    "nextBillingDate": "2025-01-15T10:00:00.000Z",
    "paymentMethod": "CREDIT_CARD",
    "plan": {
      "id": "plan_123",
      "displayName": "Plano Premium",
      "monthlyPrice": 899.99,
      "annualPrice": 9599.99,
      "monthlyCredits": 2000
    },
    "client": {
      "fullName": "João Silva",
      "user": {
        "email": "joao@empresa.com"
      }
    }
  },
  "transaction": {
    "amount": 8532.89,
    "credits": 24000,
    "description": "Subscription purchase: Plano Premium (Annual)",
    "isUpgrade": false
  }
}
```

##### Response (200 OK) - Mudança de Plano
```json
{
  "subscription": {
    "id": "sub_890",
    "clientId": "client_456",
    "planId": "plan_789",
    "status": "ACTIVE",
    "isAnnual": false,
    "nextBillingDate": "2024-02-15T10:00:00.000Z",
    "paymentMethod": "PIX",
    "plan": {
      "id": "plan_789",
      "displayName": "Plano Enterprise",
      "monthlyPrice": 1599.99,
      "monthlyCredits": 5000
    }
  },
  "transaction": {
    "amount": 450.75,
    "credits": 2500,
    "description": "Subscription change from Plano Premium to Plano Enterprise (Monthly)",
    "isUpgrade": true
  }
}
```

### 💎 Purchase Credit Package
**POST** `/billing/purchase/credits`

**Permissões**: Apenas `CLIENT`

Este endpoint permite que clientes comprem pacotes de créditos avulsos que são adicionados imediatamente à carteira.

##### Request Body
```json
{
  "packageId": "package_456",
  "paymentMethod": "PIX"
}
```

##### Request Body Fields
- `packageId` (string, required) - ID do pacote de créditos
- `paymentMethod` (enum, required) - Método de pagamento: "CREDIT_CARD", "PIX", "BOLETO"

##### Response (200 OK)
```json
{
  "wallet": {
    "id": "wallet_123",
    "clientId": "client_456",
    "availableCredits": 8500,
    "totalEarned": 12000,
    "totalSpent": 3500,
    "lastTransaction": "2024-01-15T15:30:00.000Z",
    "client": {
      "fullName": "Maria Oliveira",
      "user": {
        "email": "maria@empresa.com"
      }
    }
  },
  "transaction": {
    "id": "txn_789",
    "type": "CREDIT_PURCHASE",
    "amount": 1999.99,
    "credits": 6000,
    "description": "Credit package purchase: Mega Pack",
    "paymentMethod": "PIX",
    "status": "COMPLETED",
    "processedAt": "2024-01-15T15:30:00.000Z"
  },
  "package": {
    "id": "package_456",
    "displayName": "Mega Pack",
    "price": 1999.99,
    "credits": 5000,
    "bonusCredits": 1000
  },
  "totalCredits": 6000,
  "breakdown": {
    "baseCredits": 5000,
    "bonusCredits": 1000,
    "totalCredits": 6000,
    "pricePerCredit": "0.3333"
  }
}
```

---

## 🎯 Purchase Logic & Business Rules

### Subscription Purchase Logic

#### 1. Nova Assinatura
- Cliente sem assinatura ativa
- Créditos são adicionados conforme o plano
- Cobrança imediata do valor total

#### 2. Mudança de Plano (Upgrade/Downgrade)
- **Reembolso Proporcional**: Calcula dias restantes da assinatura atual
- **Diferença de Preço**: Cobra apenas a diferença entre planos
- **Ajuste de Créditos**: Adiciona/remove créditos baseado na diferença
- **Cancelamento**: Assinatura anterior é cancelada automaticamente

### Pricing Calculations

#### Plano Anual com Desconto
```javascript
// Exemplo: Plano Premium Anual
const plano = {
  monthlyPrice: 899.99,
  annualPrice: 9599.99,
  discountType: 'PERCENTAGE',
  discountValue: 11.11,
  monthlyCredits: 2000
};

// Cálculos para cobrança anual
const precoMensalEquivalente = plano.monthlyPrice * 12; // 10.799,88
const precoComDesconto = plano.annualPrice * (1 - 11.11/100); // 8.532,89
const economia = precoMensalEquivalente - precoComDesconto; // 2.266,99
const creditosAnuais = plano.monthlyCredits * 12; // 24.000 créditos
```

#### Pro-Rated Billing (Cobrança Proporcional)
```javascript
// Exemplo: Mudança de plano no meio do ciclo
const diasRestantes = 15; // 15 dias até próxima cobrança
const planoAtual = { monthlyPrice: 299.99, monthlyCredits: 500 };
const novoPlano = { monthlyPrice: 899.99, monthlyCredits: 2000 };

// Reembolso proporcional
const precoDiarioAtual = planoAtual.monthlyPrice / 30; // 9,99
const reembolso = precoDiarioAtual * diasRestantes; // 149,85

// Diferença a pagar
const diferencaPreco = novoPlano.monthlyPrice - reembolso; // 750,14

// Créditos a adicionar
const creditosDiariosAtuais = planoAtual.monthlyCredits / 30; // 16,67
const creditosRestantes = creditosDiariosAtuais * diasRestantes; // 250
const creditosAdicionar = novoPlano.monthlyCredits - creditosRestantes; // 1.750
```

### Credit Package Logic

#### Créditos com Bônus
```javascript
// Exemplo: Mega Pack
const pacote = {
  price: 1999.99,
  credits: 5000,      // Créditos base
  bonusCredits: 1000  // Créditos bônus
};

const totalCreditos = pacote.credits + pacote.bonusCredits; // 6.000
const precoPorCredito = pacote.price / totalCreditos; // R$ 0,33 por crédito
```

---

## 🎨 Frontend Integration Examples

### 1. Subscription Purchase Component (React)
```tsx
import { useState } from 'react';

interface PurchaseSubscriptionProps {
  plan: SubscriptionPlan;
  onSuccess: (result: any) => void;
}

const PurchaseSubscription: React.FC<PurchaseSubscriptionProps> = ({ plan, onSuccess }) => {
  const [isAnnual, setIsAnnual] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CREDIT_CARD');
  const [loading, setLoading] = useState(false);

  const calculatePrice = () => {
    if (isAnnual && plan.annualPrice) {
      let finalPrice = plan.annualPrice;
      if (plan.discountType && plan.discountValue) {
        if (plan.discountType === 'PERCENTAGE') {
          finalPrice = plan.annualPrice * (1 - plan.discountValue / 100);
        } else if (plan.discountType === 'VALUE') {
          finalPrice = plan.annualPrice - plan.discountValue;
        }
      }
      return finalPrice;
    }
    return plan.monthlyPrice;
  };

  const handlePurchase = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/billing/purchase/subscription', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          planId: plan.id,
          isAnnual,
          paymentMethod
        })
      });
      
      const result = await response.json();
      if (response.ok) {
        onSuccess(result);
      } else {
        alert(`Erro: ${result.error}`);
      }
    } catch (error) {
      alert('Erro ao processar compra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="purchase-subscription">
      <h3>Assinar {plan.displayName}</h3>
      
      {/* Billing Cycle Toggle */}
      <div className="billing-cycle">
        <label>
          <input 
            type="radio" 
            checked={!isAnnual} 
            onChange={() => setIsAnnual(false)} 
          />
          Mensal - R$ {plan.monthlyPrice.toFixed(2)}
        </label>
        
        {plan.annualPrice && (
          <label>
            <input 
              type="radio" 
              checked={isAnnual} 
              onChange={() => setIsAnnual(true)} 
            />
            Anual - R$ {calculatePrice().toFixed(2)}
            {plan.discountType && (
              <span className="discount">
                {plan.discountType === 'PERCENTAGE' 
                  ? `${plan.discountValue}% OFF` 
                  : `-R$ ${plan.discountValue}`}
              </span>
            )}
          </label>
        )}
      </div>

      {/* Payment Method */}
      <div className="payment-method">
        <label>Forma de pagamento:</label>
        <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}>
          <option value="CREDIT_CARD">Cartão de Crédito</option>
          <option value="PIX">PIX</option>
          <option value="BOLETO">Boleto</option>
        </select>
      </div>

      <button 
        onClick={handlePurchase} 
        disabled={loading}
        className="purchase-btn"
      >
        {loading ? 'Processando...' : `Assinar por R$ ${calculatePrice().toFixed(2)}`}
      </button>
    </div>
  );
};
```

### 2. Credit Package Purchase Component (React)
```tsx
const PurchaseCreditPackage: React.FC<{ package: CreditPackage }> = ({ package: pkg }) => {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('PIX');
  const [loading, setLoading] = useState(false);

  const totalCredits = pkg.credits + (pkg.bonusCredits || 0);
  const pricePerCredit = (pkg.price / totalCredits).toFixed(4);

  const handlePurchase = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/billing/purchase/credits', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          packageId: pkg.id,
          paymentMethod
        })
      });
      
      const result = await response.json();
      if (response.ok) {
        alert(`Sucesso! ${result.totalCredits} créditos adicionados à sua carteira.`);
      } else {
        alert(`Erro: ${result.error}`);
      }
    } catch (error) {
      alert('Erro ao processar compra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="purchase-credits">
      <h3>{pkg.displayName}</h3>
      <div className="package-details">
        <p>{pkg.credits.toLocaleString()} créditos</p>
        {pkg.bonusCredits > 0 && (
          <p className="bonus">+ {pkg.bonusCredits.toLocaleString()} créditos bônus</p>
        )}
        <p className="total">Total: {totalCredits.toLocaleString()} créditos</p>
        <p className="price-per-credit">R$ {pricePerCredit} por crédito</p>
      </div>
      
      <div className="payment-method">
        <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}>
          <option value="CREDIT_CARD">Cartão de Crédito</option>
          <option value="PIX">PIX</option>
          <option value="BOLETO">Boleto</option>
        </select>
      </div>

      <button onClick={handlePurchase} disabled={loading}>
        {loading ? 'Processando...' : `Comprar por R$ ${pkg.price.toFixed(2)}`}
      </button>
    </div>
  );
};
```

---

## 🧪 Testing Examples

### Purchase Subscription (cURL)
```bash
# Nova assinatura anual
curl -X POST "http://localhost:4000/billing/purchase/subscription" \
  -H "Authorization: Bearer YOUR_CLIENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "planId": "plan_123",
    "isAnnual": true,
    "paymentMethod": "PIX"
  }'

# Mudança para plano mensal
curl -X POST "http://localhost:4000/billing/purchase/subscription" \
  -H "Authorization: Bearer YOUR_CLIENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "planId": "plan_456",
    "isAnnual": false,
    "paymentMethod": "CREDIT_CARD"
  }'
```

### Purchase Credit Package (cURL)
```bash
curl -X POST "http://localhost:4000/billing/purchase/credits" \
  -H "Authorization: Bearer YOUR_CLIENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "packageId": "package_789",
    "paymentMethod": "PIX"
  }'
```

---

Este sistema fornece uma base sólida para monetização através de planos de assinatura e venda de créditos, com flexibilidade para diferentes estratégias de preços e promoções, incluindo lógica avançada de upgrade/downgrade de planos com cobrança proporcional.
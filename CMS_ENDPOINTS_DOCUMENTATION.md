# 🎨 CMS Endpoints Documentation

## 📖 Overview

Este documento descreve todos os endpoints do sistema CMS (Content Management System) da Nerdzup. O CMS permite gerenciar o conteúdo do site institucional, incluindo configurações gerais, cards de serviços, etapas do processo, casos de sucesso, logos de clientes e FAQ.

---

## 🔐 Authentication & Permissions

Todos os endpoints requerem autenticação JWT, exceto o endpoint público.

### Required Headers
```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

### Permission Levels
- **ADMIN**: Acesso total (criar, editar, deletar)
- **EMPLOYEE**: Apenas visualização da configuração
- **PUBLIC**: Apenas endpoint público da configuração

---

## 🌐 Website Configuration

### Get Website Configuration (Admin/Employee)
**GET** `/cms/config`

**Permissões**: `ADMIN`, `EMPLOYEE`

##### Response (200 OK)
```json
{
  "id": "config_123",
  "logoUrl": "https://cdn.nerdzup.com/logo.png",
  "faviconUrl": "https://cdn.nerdzup.com/favicon.ico",
  "siteName": "Nerdzup - Marketing Agency",
  "supportEmail": "contato@nerdzup.com",
  "siteDescription": "Agência de marketing digital especializada em crescimento empresarial",
  "whatsapp": "+5511999999999",
  "clientsCounter": "200+",
  "counterText": "Clientes atendidos",
  "heroTitle": "Transforme seu negócio",
  "heroSubtitle": "Marketing digital que gera resultados",
  "heroDescription": "Ajudamos empresas a crescer através de estratégias digitais eficazes",
  "processTitle": "Nosso Processo",
  "processButtonText": "Conhecer Processo",
  "processButtonLink": "https://nerdzup.com/processo",
  "videoTitle": "Veja como funciona",
  "videoButtonText": "Assistir Vídeo",
  "videoButtonLink": "https://youtube.com/watch?v=123",
  "videoUrl": "https://youtube.com/embed/123",
  "videoPosterUrl": "https://img.youtube.com/vi/123/maxresdefault.jpg",
  "faqTitle": "Perguntas Frequentes",
  "footerText": "Nerdzup - Sua agência de marketing digital",
  "footerCopyright": "© 2024 Nerdzup. Todos os direitos reservados.",
  "instagramLink": "https://instagram.com/nerdzup",
  "twitterLink": "https://twitter.com/nerdzup",
  "facebookLink": "https://facebook.com/nerdzup",
  "updatedBy": "admin_123",
  "updatedAt": "2024-01-15T10:00:00.000Z",
  "serviceCards": [
    {
      "id": "card_123",
      "title": "Marketing Digital",
      "imageUrl": "https://cdn.nerdzup.com/service-marketing.jpg",
      "order": 1
    }
  ],
  "processSteps": [
    {
      "id": "step_123",
      "title": "Análise",
      "description": "Analisamos seu negócio e mercado",
      "imageUrl": "https://cdn.nerdzup.com/step-1.jpg",
      "order": 1
    }
  ],
  "successCases": [
    {
      "id": "case_123",
      "personName": "João Silva",
      "personRole": "CEO da TechCorp",
      "personPhotoUrl": "https://cdn.nerdzup.com/joao.jpg",
      "caseImageUrl": "https://cdn.nerdzup.com/case-techcorp.jpg",
      "caseText": "A Nerdzup transformou nosso negócio...",
      "order": 1
    }
  ],
  "clientLogos": [
    {
      "id": "logo_123",
      "imageUrl": "https://cdn.nerdzup.com/client-logo-1.png",
      "altText": "Cliente 1",
      "order": 1
    }
  ],
  "faqItems": [
    {
      "id": "faq_123",
      "question": "Como funciona o processo?",
      "answer": "Nosso processo é dividido em 5 etapas...",
      "order": 1
    }
  ]
}
```

### Update Website Configuration
**PUT** `/cms/config`

**Permissões**: Apenas `ADMIN`

##### Request Body
```json
{
  "siteName": "Nerdzup - Marketing Digital",
  "supportEmail": "contato@nerdzup.com",
  "siteDescription": "Agência especializada em marketing digital",
  "whatsapp": "+5511999999999",
  "clientsCounter": "250+",
  "counterText": "Clientes satisfeitos",
  "heroTitle": "Acelere seu crescimento",
  "heroSubtitle": "Marketing que converte",
  "heroDescription": "Estratégias digitais personalizadas para o seu negócio",
  "processTitle": "Como Trabalhamos",
  "processButtonText": "Ver Processo",
  "processButtonLink": "https://nerdzup.com/processo",
  "videoTitle": "Conheça nosso trabalho",
  "videoButtonText": "Ver Vídeo",
  "videoButtonLink": "https://youtube.com/watch?v=456",
  "videoUrl": "https://youtube.com/embed/456",
  "videoPosterUrl": "https://img.youtube.com/vi/456/maxresdefault.jpg",
  "faqTitle": "Tire suas dúvidas",
  "footerText": "Nerdzup - Transformando negócios digitalmente",
  "footerCopyright": "© 2024 Nerdzup. Todos os direitos reservados.",
  "instagramLink": "https://instagram.com/nerdzup_oficial",
  "twitterLink": "https://twitter.com/nerdzup_oficial",
  "facebookLink": "https://facebook.com/nerdzup.oficial"
}
```

##### Response (200 OK)
```json
{
  "id": "config_123",
  "siteName": "Nerdzup - Marketing Digital",
  "supportEmail": "contato@nerdzup.com",
  "updatedBy": "admin_123",
  "updatedAt": "2024-01-15T15:30:00.000Z"
}
```

### Get Public Website Configuration
**GET** `/cms/config/public`

**Permissões**: Público (sem autenticação)

##### Response (200 OK)
```json
{
  "siteName": "Nerdzup - Marketing Agency",
  "logoUrl": "https://cdn.nerdzup.com/logo.png",
  "faviconUrl": "https://cdn.nerdzup.com/favicon.ico",
  "siteDescription": "Agência de marketing digital",
  "heroTitle": "Transforme seu negócio",
  "heroSubtitle": "Marketing digital que gera resultados",
  "serviceCards": [...],
  "processSteps": [...],
  "successCases": [...],
  "clientLogos": [...],
  "faqItems": [...]
}
```

---

## 🎴 Service Cards Management

### Create Service Card
**POST** `/cms/service-cards`

**Permissões**: Apenas `ADMIN`

##### Request Body
```json
{
  "title": "Desenvolvimento Web",
  "imageUrl": "https://cdn.nerdzup.com/service-web.jpg",
  "order": 1
}
```

##### Response (201 Created)
```json
{
  "id": "card_456",
  "title": "Desenvolvimento Web",
  "imageUrl": "https://cdn.nerdzup.com/service-web.jpg",
  "order": 1,
  "createdAt": "2024-01-15T16:00:00.000Z",
  "updatedAt": "2024-01-15T16:00:00.000Z"
}
```

### Update Service Card
**PUT** `/cms/service-cards/:id`

**Permissões**: Apenas `ADMIN`

##### Request Body
```json
{
  "title": "Desenvolvimento Web Completo",
  "imageUrl": "https://cdn.nerdzup.com/service-web-updated.jpg",
  "order": 2
}
```

##### Response (200 OK)
```json
{
  "id": "card_456",
  "title": "Desenvolvimento Web Completo",
  "imageUrl": "https://cdn.nerdzup.com/service-web-updated.jpg",
  "order": 2,
  "updatedAt": "2024-01-15T16:30:00.000Z"
}
```

### Delete Service Card
**DELETE** `/cms/service-cards/:id`

**Permissões**: Apenas `ADMIN`

##### Response (200 OK)
```json
{
  "message": "Service card deleted successfully"
}
```

### Reorder Service Cards
**PUT** `/cms/service-cards/reorder`

**Permissões**: Apenas `ADMIN`

##### Request Body
```json
{
  "ids": ["card_456", "card_123", "card_789"]
}
```

##### Response (200 OK)
```json
{
  "message": "Service cards reordered successfully"
}
```

---

## 🔄 Process Steps Management

### Create Process Step
**POST** `/cms/process-steps`

**Permissões**: Apenas `ADMIN`

##### Request Body
```json
{
  "title": "Estratégia",
  "description": "Definimos a estratégia personalizada para seu negócio",
  "imageUrl": "https://cdn.nerdzup.com/process-strategy.jpg",
  "order": 1
}
```

##### Response (201 Created)
```json
{
  "id": "step_456",
  "title": "Estratégia",
  "description": "Definimos a estratégia personalizada para seu negócio",
  "imageUrl": "https://cdn.nerdzup.com/process-strategy.jpg",
  "order": 1,
  "createdAt": "2024-01-15T17:00:00.000Z",
  "updatedAt": "2024-01-15T17:00:00.000Z"
}
```

### Update Process Step
**PUT** `/cms/process-steps/:id`

**Permissões**: Apenas `ADMIN`

##### Request Body
```json
{
  "title": "Estratégia Digital",
  "description": "Criamos uma estratégia digital completa e personalizada",
  "imageUrl": "https://cdn.nerdzup.com/process-strategy-new.jpg",
  "order": 1
}
```

### Delete Process Step
**DELETE** `/cms/process-steps/:id`

**Permissões**: Apenas `ADMIN`

##### Response (200 OK)
```json
{
  "message": "Process step deleted successfully"
}
```

### Reorder Process Steps
**PUT** `/cms/process-steps/reorder`

**Permissões**: Apenas `ADMIN`

##### Request Body
```json
{
  "ids": ["step_123", "step_456", "step_789", "step_101"]
}
```

---

## 🏆 Success Cases Management

### Create Success Case
**POST** `/cms/success-cases`

**Permissões**: Apenas `ADMIN`

##### Request Body
```json
{
  "personName": "Maria Oliveira",
  "personRole": "Diretora de Marketing da InnovaCorp",
  "personPhotoUrl": "https://cdn.nerdzup.com/maria-photo.jpg",
  "caseImageUrl": "https://cdn.nerdzup.com/case-innovacorp.jpg",
  "caseText": "Com a Nerdzup, conseguimos aumentar nossas vendas em 300% em apenas 6 meses. O trabalho da equipe foi excepcional, desde o planejamento até a execução das campanhas.",
  "order": 1
}
```

##### Response (201 Created)
```json
{
  "id": "case_456",
  "personName": "Maria Oliveira",
  "personRole": "Diretora de Marketing da InnovaCorp",
  "personPhotoUrl": "https://cdn.nerdzup.com/maria-photo.jpg",
  "caseImageUrl": "https://cdn.nerdzup.com/case-innovacorp.jpg",
  "caseText": "Com a Nerdzup, conseguimos aumentar nossas vendas em 300%...",
  "order": 1,
  "createdAt": "2024-01-15T18:00:00.000Z",
  "updatedAt": "2024-01-15T18:00:00.000Z"
}
```

### Update Success Case
**PUT** `/cms/success-cases/:id`

**Permissões**: Apenas `ADMIN`

### Delete Success Case
**DELETE** `/cms/success-cases/:id`

**Permissões**: Apenas `ADMIN`

### Reorder Success Cases
**PUT** `/cms/success-cases/reorder`

**Permissões**: Apenas `ADMIN`

---

## 🏢 Client Logos Management

### Create Client Logo
**POST** `/cms/client-logos`

**Permissões**: Apenas `ADMIN`

##### Request Body
```json
{
  "imageUrl": "https://cdn.nerdzup.com/client-logo-techcorp.png",
  "altText": "TechCorp - Cliente Nerdzup",
  "order": 1
}
```

##### Response (201 Created)
```json
{
  "id": "logo_456",
  "imageUrl": "https://cdn.nerdzup.com/client-logo-techcorp.png",
  "altText": "TechCorp - Cliente Nerdzup",
  "order": 1,
  "createdAt": "2024-01-15T19:00:00.000Z",
  "updatedAt": "2024-01-15T19:00:00.000Z"
}
```

### Update Client Logo
**PUT** `/cms/client-logos/:id`

**Permissões**: Apenas `ADMIN`

### Delete Client Logo
**DELETE** `/cms/client-logos/:id`

**Permissões**: Apenas `ADMIN`

### Reorder Client Logos
**PUT** `/cms/client-logos/reorder`

**Permissões**: Apenas `ADMIN`

---

## ❓ FAQ Items Management

### Create FAQ Item
**POST** `/cms/faq-items`

**Permissões**: Apenas `ADMIN`

##### Request Body
```json
{
  "question": "Quanto tempo leva para ver resultados?",
  "answer": "Os primeiros resultados geralmente aparecem entre 30 a 90 dias, dependendo da estratégia implementada e do mercado de atuação. Nosso foco é em resultados sustentáveis a longo prazo.",
  "order": 1
}
```

##### Response (201 Created)
```json
{
  "id": "faq_456",
  "question": "Quanto tempo leva para ver resultados?",
  "answer": "Os primeiros resultados geralmente aparecem entre 30 a 90 dias...",
  "order": 1,
  "createdAt": "2024-01-15T20:00:00.000Z",
  "updatedAt": "2024-01-15T20:00:00.000Z"
}
```

### Update FAQ Item
**PUT** `/cms/faq-items/:id`

**Permissões**: Apenas `ADMIN`

##### Request Body
```json
{
  "question": "Em quanto tempo vejo os primeiros resultados?",
  "answer": "Os resultados iniciais costumam aparecer entre 30 a 90 dias, variando conforme a estratégia e o nicho de mercado. Priorizamos crescimento sustentável e duradouro.",
  "order": 1
}
```

### Delete FAQ Item
**DELETE** `/cms/faq-items/:id`

**Permissões**: Apenas `ADMIN`

### Reorder FAQ Items
**PUT** `/cms/faq-items/reorder`

**Permissões**: Apenas `ADMIN`

---

## 🎭 Favicon Management

### Upload Favicon
**POST** `/cms/favicon`

**Permissões**: Apenas `ADMIN`

**Content-Type**: `multipart/form-data`

##### Request Body (FormData)
```
favicon: [File] (ICO, PNG, JPEG, JPG, SVG - max 2MB)
```

##### Response (200 OK)
```json
{
  "message": "Favicon uploaded successfully",
  "faviconUrl": "https://cdn.nerdzup.com/uploads/favicon/favicon-abc123.ico",
  "config": {
    "id": "config_123",
    "faviconUrl": "https://cdn.nerdzup.com/uploads/favicon/favicon-abc123.ico",
    "updatedAt": "2024-01-15T21:00:00.000Z"
  }
}
```

### Get Current Favicon
**GET** `/cms/favicon`

**Permissões**: Público (sem autenticação)

##### Response (200 OK)
```json
{
  "faviconUrl": "https://cdn.nerdzup.com/favicon.ico",
  "updatedAt": "2024-01-15T21:00:00.000Z"
}
```

### Remove Favicon
**DELETE** `/cms/favicon`

**Permissões**: Apenas `ADMIN`

##### Response (200 OK)
```json
{
  "message": "Favicon removed successfully"
}
```

---

## 🎨 Frontend Integration Examples

### 1. Website Configuration Hook (React)
```tsx
import { useState, useEffect } from 'react';

interface WebsiteConfig {
  siteName: string;
  logoUrl: string;
  heroTitle: string;
  heroSubtitle: string;
  serviceCards: ServiceCard[];
  processSteps: ProcessStep[];
  successCases: SuccessCase[];
  clientLogos: ClientLogo[];
  faqItems: FaqItem[];
}

export const useWebsiteConfig = () => {
  const [config, setConfig] = useState<WebsiteConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch('/api/cms/config/public');
        if (!response.ok) throw new Error('Failed to fetch config');
        
        const data = await response.json();
        setConfig(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, []);

  return { config, loading, error };
};
```

### 2. Service Cards Component (React)
```tsx
import { useWebsiteConfig } from './hooks/useWebsiteConfig';

const ServiceCards: React.FC = () => {
  const { config, loading } = useWebsiteConfig();

  if (loading) return <div>Carregando serviços...</div>;

  return (
    <section className="services">
      <div className="services-grid">
        {config?.serviceCards.map((card) => (
          <div key={card.id} className="service-card">
            <img src={card.imageUrl} alt={card.title} />
            <h3>{card.title}</h3>
          </div>
        ))}
      </div>
    </section>
  );
};
```

### 3. Process Steps Component (React)
```tsx
const ProcessSteps: React.FC = () => {
  const { config } = useWebsiteConfig();

  return (
    <section className="process">
      <h2>{config?.processTitle}</h2>
      <div className="process-steps">
        {config?.processSteps.map((step, index) => (
          <div key={step.id} className="process-step">
            <div className="step-number">{index + 1}</div>
            <img src={step.imageUrl} alt={step.title} />
            <h3>{step.title}</h3>
            <p>{step.description}</p>
          </div>
        ))}
      </div>
      {config?.processButtonText && (
        <a 
          href={config.processButtonLink} 
          className="process-btn"
          target="_blank"
          rel="noopener noreferrer"
        >
          {config.processButtonText}
        </a>
      )}
    </section>
  );
};
```

### 4. FAQ Component (React)
```tsx
import { useState } from 'react';

const FAQ: React.FC = () => {
  const { config } = useWebsiteConfig();
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());

  const toggleItem = (id: string) => {
    setOpenItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  return (
    <section className="faq">
      <h2>{config?.faqTitle}</h2>
      <div className="faq-items">
        {config?.faqItems.map((item) => (
          <div 
            key={item.id} 
            className={`faq-item ${openItems.has(item.id) ? 'open' : ''}`}
          >
            <button 
              className="faq-question"
              onClick={() => toggleItem(item.id)}
            >
              {item.question}
              <span className="faq-icon">
                {openItems.has(item.id) ? '−' : '+'}
              </span>
            </button>
            {openItems.has(item.id) && (
              <div className="faq-answer">
                <p>{item.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};
```

### 5. Admin Management Hook (React)
```tsx
export const useAdminCms = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apiCall = async (url: string, options: RequestInit) => {
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

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateConfig = (configData: Partial<WebsiteConfig>) =>
    apiCall('/api/cms/config', {
      method: 'PUT',
      body: JSON.stringify(configData)
    });

  const createServiceCard = (cardData: CreateServiceCardDto) =>
    apiCall('/api/cms/service-cards', {
      method: 'POST',
      body: JSON.stringify(cardData)
    });

  const createFaqItem = (faqData: CreateFaqItemDto) =>
    apiCall('/api/cms/faq-items', {
      method: 'POST',
      body: JSON.stringify(faqData)
    });

  return {
    loading,
    error,
    updateConfig,
    createServiceCard,
    createFaqItem
  };
};
```

---

## 🧪 Testing Examples

### Update Website Configuration (cURL)
```bash
curl -X PUT "http://localhost:4000/cms/config" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "siteName": "Nerdzup - Marketing Digital",
    "heroTitle": "Transforme seu negócio hoje",
    "supportEmail": "contato@nerdzup.com"
  }'
```

### Create Service Card (cURL)
```bash
curl -X POST "http://localhost:4000/cms/service-cards" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "SEO Avançado",
    "imageUrl": "https://cdn.nerdzup.com/seo.jpg",
    "order": 3
  }'
```

### Upload Favicon (cURL)
```bash
curl -X POST "http://localhost:4000/cms/favicon" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -F "favicon=@/path/to/favicon.ico"
```

### Get Public Configuration (cURL)
```bash
curl -X GET "http://localhost:4000/cms/config/public"
```

---

## 💡 Best Practices

### 1. Content Management
- Use imagens otimizadas (WebP quando possível)
- Mantenha URLs de imagem consistentes
- Configure textos em português para o público brasileiro
- Use ordem lógica nos elementos (order field)

### 2. SEO Optimization
- Configure meta description adequada
- Use alt text descritivo nas imagens
- Estruture FAQ com perguntas relevantes
- Mantenha URLs limpas e semânticas

### 3. Performance
- Cache configuração pública no frontend
- Otimize imagens antes do upload
- Use CDN para assets estáticos
- Implemente lazy loading para imagens

### 4. User Experience
- Mantenha textos claros e objetivos
- Use hierarquia visual adequada
- Configure CTAs (calls-to-action) estratégicos
- Teste responsividade em diferentes dispositivos

---

Este sistema CMS fornece controle completo sobre o conteúdo do site institucional, permitindo atualizações dinâmicas sem necessidade de deploy de código.
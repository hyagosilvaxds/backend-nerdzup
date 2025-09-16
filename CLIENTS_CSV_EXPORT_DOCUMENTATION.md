# 📊 Client CSV Export Documentation

## 📖 Overview

Este documento descreve o endpoint para exportar a lista de clientes em formato CSV. O endpoint permite ao administrador baixar todos os dados dos clientes em um arquivo CSV formatado, incluindo informações pessoais, empresariais, dados de wallet e estatísticas de solicitações.

---

## 📥 Export Clients to CSV

### GET `/clients/export/csv`

**Descrição**: Exporta a lista de clientes em formato CSV como download de arquivo.

**Permissões**: Apenas `ADMIN` com permissão `READ_CLIENTS`

### Query Parameters

Todos os parâmetros são opcionais e permitem filtrar os dados antes da exportação:

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `search` | string | Buscar por nome, email, empresa ou nome fantasia | `?search=João Silva` |
| `sortBy` | string | Campo para ordenação (`createdAt`, `fullName`, `companyName`, `totalSpent`) | `?sortBy=fullName` |
| `sortOrder` | string | Ordem de classificação (`asc` ou `desc`) | `?sortOrder=asc` |

### Request Examples

#### 1. Export All Clients
```http
GET /clients/export/csv
Authorization: Bearer <admin_jwt_token>
```

#### 2. Export Filtered Clients
```http
GET /clients/export/csv?search=Tecnologia&sortBy=companyName&sortOrder=asc
Authorization: Bearer <admin_jwt_token>
```

#### 3. Export Clients by Name
```http
GET /clients/export/csv?search=Maria Santos
Authorization: Bearer <admin_jwt_token>
```

### Response Headers
```http
Content-Type: text/csv
Content-Disposition: attachment; filename="clients-export.csv"
```

### CSV Structure

O arquivo CSV exportado contém as seguintes colunas:

| Column | Description | Example |
|--------|-------------|---------|
| `ID` | ID único do cliente | `"client_12345"` |
| `Nome Completo` | Nome completo do cliente | `"João Silva"` |
| `Email` | Email do usuário | `"joao@email.com"` |
| `Tipo de Pessoa` | Pessoa física ou jurídica | `"INDIVIDUAL"` |
| `CPF/CNPJ` | Documento de identificação | `"123.456.789-00"` |
| `Cargo` | Posição/cargo do cliente | `"CEO"` |
| `Nome da Empresa` | Razão social | `"Tech Solutions LTDA"` |
| `Nome Fantasia` | Nome fantasia | `"TechSol"` |
| `Setor` | Setor de atuação | `"Tecnologia"` |
| `Tamanho da Empresa` | Porte da empresa | `"SMALL"` |
| `Website` | Website da empresa | `"https://techsol.com"` |
| `Telefone` | Telefone de contato | `"+5511999999999"` |
| `Endereço` | Endereço completo | `"Rua das Flores, 123"` |
| `Cidade` | Cidade | `"São Paulo"` |
| `Estado` | Estado/UF | `"SP"` |
| `CEP` | Código postal | `"01234-567"` |
| `País` | País | `"Brasil"` |
| `Status` | Status do usuário | `"Ativo"` ou `"Inativo"` |
| `Créditos Disponíveis` | Créditos atuais na wallet | `"150"` |
| `Total Ganho` | Total de créditos já recebidos | `"500"` |
| `Total Gasto` | Total de créditos já gastos | `"350"` |
| `Solicitações Pendentes` | Número de solicitações pendentes | `"2"` |
| `Solicitações Aprovadas` | Número de solicitações aprovadas | `"8"` |
| `Solicitações Rejeitadas` | Número de solicitações rejeitadas | `"1"` |
| `Data de Cadastro` | Data de criação do cliente | `"15/01/2024"` |

### Sample CSV Output

```csv
ID,Nome Completo,Email,Tipo de Pessoa,CPF/CNPJ,Cargo,Nome da Empresa,Nome Fantasia,Setor,Tamanho da Empresa,Website,Telefone,Endereço,Cidade,Estado,CEP,País,Status,Créditos Disponíveis,Total Ganho,Total Gasto,Solicitações Pendentes,Solicitações Aprovadas,Solicitações Rejeitadas,Data de Cadastro
"client_123","João Silva","joao@techsol.com","BUSINESS","12.345.678/0001-90","CEO","Tech Solutions LTDA","TechSol","Tecnologia","SMALL","https://techsol.com","+5511999999999","Rua das Flores, 123","São Paulo","SP","01234-567","Brasil","Ativo","150","500","350","2","8","1","15/01/2024"
"client_456","Maria Santos","maria@designstudio.com","INDIVIDUAL","987.654.321-00","Designer","Design Studio ME","DesignStudio","Design","MICRO","https://designstudio.com","+5511888888888","Av. Paulista, 456","São Paulo","SP","01310-100","Brasil","Ativo","75","200","125","1","5","0","20/01/2024"
```

---

## 🚀 Frontend Integration Examples

### 1. JavaScript/Fetch API
```javascript
async function exportClientsCsv(filters = {}) {
  const token = localStorage.getItem('adminToken');
  const queryParams = new URLSearchParams(filters).toString();
  
  try {
    const response = await fetch(`/api/clients/export/csv?${queryParams}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'text/csv'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to export CSV');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'clients-export.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error exporting CSV:', error);
  }
}

// Usage examples
exportClientsCsv(); // Export all clients
exportClientsCsv({ search: 'Tecnologia' }); // Export filtered clients
exportClientsCsv({ sortBy: 'fullName', sortOrder: 'asc' }); // Export sorted clients
```

### 2. React Hook Example
```tsx
import { useState } from 'react';

interface ExportFilters {
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

const useClientsCsvExport = () => {
  const [isExporting, setIsExporting] = useState(false);

  const exportCsv = async (filters: ExportFilters = {}) => {
    setIsExporting(true);
    
    try {
      const token = localStorage.getItem('adminToken');
      const queryParams = new URLSearchParams(
        Object.entries(filters).reduce((acc, [key, value]) => {
          if (value) acc[key] = value;
          return acc;
        }, {} as Record<string, string>)
      );

      const response = await fetch(`/api/clients/export/csv?${queryParams}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'text/csv'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      // Create download link
      const link = document.createElement('a');
      link.href = url;
      link.download = `clients-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Cleanup
      window.URL.revokeObjectURL(url);
      
      return { success: true };
    } catch (error) {
      console.error('CSV export failed:', error);
      return { success: false, error: error.message };
    } finally {
      setIsExporting(false);
    }
  };

  return { exportCsv, isExporting };
};

// Component usage
const ClientsPage = () => {
  const { exportCsv, isExporting } = useClientsCsvExport();
  
  const handleExport = () => {
    exportCsv({
      search: searchTerm,
      sortBy: 'companyName',
      sortOrder: 'asc'
    });
  };

  return (
    <button 
      onClick={handleExport} 
      disabled={isExporting}
      className="export-btn"
    >
      {isExporting ? 'Exportando...' : 'Exportar CSV'}
    </button>
  );
};
```

### 3. Vue.js Example
```javascript
// Composable
import { ref } from 'vue';

export function useClientsCsvExport() {
  const isExporting = ref(false);

  const exportCsv = async (filters = {}) => {
    isExporting.value = true;
    
    try {
      const token = localStorage.getItem('adminToken');
      const params = new URLSearchParams(filters);
      
      const response = await fetch(`/api/clients/export/csv?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'text/csv'
        }
      });

      if (!response.ok) throw new Error('Export failed');

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = 'clients-export.csv';
      link.click();
      
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export error:', error);
      throw error;
    } finally {
      isExporting.value = false;
    }
  };

  return { exportCsv, isExporting };
}
```

### 4. Angular Service Example
```typescript
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ClientsExportService {
  private baseUrl = '/api/clients';

  constructor(private http: HttpClient) {}

  exportCsv(filters: any = {}): Observable<Blob> {
    const token = localStorage.getItem('adminToken');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Accept': 'text/csv'
    });

    const params = new URLSearchParams(filters).toString();
    
    return this.http.get(`${this.baseUrl}/export/csv?${params}`, {
      headers,
      responseType: 'blob'
    });
  }

  downloadCsv(filters: any = {}) {
    this.exportCsv(filters).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'clients-export.csv';
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: (error) => {
        console.error('Export failed:', error);
      }
    });
  }
}
```

---

## 🔐 Authentication & Permissions

### Required Headers
```http
Authorization: Bearer <admin_jwt_token>
Accept: text/csv
```

### Permission Requirements
- **Role**: `ADMIN`
- **Permission**: `READ_CLIENTS`

### Error Responses

#### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

#### 403 Forbidden
```json
{
  "statusCode": 403,
  "message": "Insufficient permissions",
  "error": "Forbidden"
}
```

#### 500 Internal Server Error
```json
{
  "statusCode": 500,
  "message": "Failed to generate CSV export",
  "error": "Internal Server Error"
}
```

---

## 📋 CSV Format Details

### Encoding
- **Character Encoding**: UTF-8
- **Line Endings**: CRLF (\r\n)
- **Field Separator**: Comma (,)
- **Text Qualifier**: Double quotes (")

### Data Formatting
- **Dates**: Brazilian format (DD/MM/YYYY)
- **Numbers**: No thousands separator, decimal point for decimal values
- **Boolean Values**: "Ativo" / "Inativo" for user status
- **Empty Values**: Empty string ("")
- **Text Fields**: Wrapped in double quotes to handle commas and special characters

### File Naming
- **Default**: `clients-export.csv`
- **Suggested**: Include date for uniqueness (e.g., `clients-export-2024-01-15.csv`)

---

## 💡 Usage Tips

### 1. Performance Considerations
- Large datasets may take time to process
- Consider implementing loading states in your UI
- The endpoint exports ALL matching records (no pagination)

### 2. File Handling
- Modern browsers handle CSV downloads automatically
- Consider file size limits for very large datasets
- Implement proper error handling for network failures

### 3. Data Privacy
- Ensure proper access controls before implementing
- Consider logging CSV exports for audit purposes
- Be mindful of sensitive data in the export

### 4. Filtering Best Practices
```javascript
// Good: Specific search
exportCsv({ search: 'Tech Solutions' });

// Good: Sorted export
exportCsv({ sortBy: 'companyName', sortOrder: 'asc' });

// Good: Combined filters
exportCsv({ 
  search: 'Tecnologia',
  sortBy: 'totalSpent',
  sortOrder: 'desc'
});
```

---

## 🧪 Testing the Endpoint

### Using cURL
```bash
# Basic export
curl -X GET "http://localhost:4000/clients/export/csv" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Accept: text/csv" \
  -o clients-export.csv

# With filters
curl -X GET "http://localhost:4000/clients/export/csv?search=Tecnologia&sortBy=companyName" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Accept: text/csv" \
  -o filtered-clients.csv
```

### Using Postman
1. **Method**: GET
2. **URL**: `{{baseUrl}}/clients/export/csv`
3. **Headers**:
   - `Authorization: Bearer {{adminToken}}`
   - `Accept: text/csv`
4. **Query Params** (optional):
   - `search`: Filter text
   - `sortBy`: Sorting field
   - `sortOrder`: asc or desc

---

Este endpoint fornece uma maneira completa e flexível de exportar dados de clientes em formato CSV, mantendo a segurança através de autenticação e autorização adequadas.
# System Management API Documentation

This document provides comprehensive documentation for system management endpoints including API keys, email templates, SMTP configuration, and website content management.

## Authentication
All endpoints require JWT authentication and specific roles. Include the token in the `Authorization` header:
```
Authorization: Bearer <your-jwt-token>
```

---

# API Keys Management

## Base URL
```
http://localhost:4000/api-keys
```

### 1. Create API Key
**POST** `/api-keys`

#### Description
Creates a new API key for external services like OpenAI or Stripe.

#### Required Roles
- `ADMIN`

#### Request Body
```json
{
  "name": "OpenAI Production Key",
  "provider": "OPENAI",
  "keyValue": "sk-abc123...",
  "environment": "production",
  "description": "Main OpenAI key for production use",
  "isActive": true
}
```

#### Request Body Fields
- `name` (string, required) - Descriptive name for the API key
- `provider` (enum, required) - Provider type: `OPENAI` or `STRIPE`
- `keyValue` (string, required) - The actual API key value (will be encrypted)
- `environment` (string, optional) - Environment (e.g., "production", "development")
- `description` (string, optional) - Description of the key's purpose
- `isActive` (boolean, optional) - Whether the key is active (default: true)

#### Response
```json
{
  "id": "api_key_id",
  "name": "OpenAI Production Key",
  "provider": "OPENAI",
  "environment": "production",
  "description": "Main OpenAI key for production use",
  "isActive": true,
  "createdAt": "2024-01-01T12:00:00.000Z",
  "updatedAt": "2024-01-01T12:00:00.000Z",
  "userId": "admin_user_id"
}
```

### 2. Get All API Keys
**GET** `/api-keys`

#### Description
Retrieves all API keys (key values are masked for security).

#### Required Roles
- `ADMIN`

#### Query Parameters
- `provider` (string, optional) - Filter by provider: `OPENAI` or `STRIPE`
- `isActive` (boolean, optional) - Filter by active status
- `environment` (string, optional) - Filter by environment

#### Response
```json
[
  {
    "id": "api_key_id",
    "name": "OpenAI Production Key",
    "provider": "OPENAI",
    "keyValue": "sk-***...***",
    "environment": "production",
    "description": "Main OpenAI key for production use",
    "isActive": true,
    "createdAt": "2024-01-01T12:00:00.000Z",
    "updatedAt": "2024-01-01T12:00:00.000Z",
    "user": {
      "id": "admin_user_id",
      "email": "admin@company.com"
    }
  }
]
```

### 3. Get API Key Statistics
**GET** `/api-keys/stats`

#### Description
Returns statistics about API keys.

#### Required Roles
- `ADMIN`

#### Response
```json
{
  "total": 5,
  "byProvider": {
    "OPENAI": 3,
    "STRIPE": 2
  },
  "byStatus": {
    "active": 4,
    "inactive": 1
  },
  "byEnvironment": {
    "production": 3,
    "development": 2
  }
}
```

### 4. Get Single API Key
**GET** `/api-keys/:id`

#### Description
Retrieves a specific API key (key value is masked).

#### Required Roles
- `ADMIN`

#### Response
```json
{
  "id": "api_key_id",
  "name": "OpenAI Production Key",
  "provider": "OPENAI",
  "keyValue": "sk-***...***",
  "environment": "production",
  "description": "Main OpenAI key for production use",
  "isActive": true,
  "createdAt": "2024-01-01T12:00:00.000Z",
  "updatedAt": "2024-01-01T12:00:00.000Z"
}
```

### 5. Reveal API Key Value
**GET** `/api-keys/:id/reveal`

#### Description
Reveals the actual API key value (use with caution).

#### Required Roles
- `ADMIN`

#### Response
```json
{
  "id": "api_key_id",
  "name": "OpenAI Production Key",
  "provider": "OPENAI",
  "keyValue": "sk-abc123def456...",
  "environment": "production",
  "description": "Main OpenAI key for production use",
  "isActive": true,
  "createdAt": "2024-01-01T12:00:00.000Z",
  "updatedAt": "2024-01-01T12:00:00.000Z"
}
```

### 6. Update API Key
**PATCH** `/api-keys/:id`

#### Description
Updates an existing API key.

#### Required Roles
- `ADMIN`

#### Request Body
```json
{
  "name": "OpenAI Updated Key",
  "description": "Updated description",
  "environment": "staging"
}
```

#### Response
```json
{
  "id": "api_key_id",
  "name": "OpenAI Updated Key",
  "provider": "OPENAI",
  "keyValue": "sk-***...***",
  "environment": "staging",
  "description": "Updated description",
  "isActive": true,
  "createdAt": "2024-01-01T12:00:00.000Z",
  "updatedAt": "2024-01-02T10:30:00.000Z"
}
```

### 7. Toggle API Key Status
**POST** `/api-keys/:id/toggle`

#### Description
Toggles the active status of an API key.

#### Required Roles
- `ADMIN`

#### Response
```json
{
  "id": "api_key_id",
  "name": "OpenAI Production Key",
  "isActive": false,
  "message": "API key status toggled successfully"
}
```

### 8. Delete API Key
**DELETE** `/api-keys/:id`

#### Description
Permanently deletes an API key.

#### Required Roles
- `ADMIN`

#### Response
```
204 No Content
```

---

# Email Templates Management

## Base URL
```
http://localhost:4000/email-templates
```

### 9. Create Email Template
**POST** `/email-templates`

#### Description
Creates a new email template with HTML and text content.

#### Required Roles
- `ADMIN`

#### Request Body
```json
{
  "name": "welcome_email",
  "displayName": "Welcome Email",
  "category": "onboarding",
  "subject": "Welcome to {{company_name}}!",
  "htmlContent": "<h1>Welcome {{user_name}}!</h1><p>Thank you for joining {{company_name}}.</p>",
  "textContent": "Welcome {{user_name}}! Thank you for joining {{company_name}}.",
  "variables": ["user_name", "company_name"],
  "description": "Welcome email sent to new users",
  "isActive": true
}
```

#### Request Body Fields
- `name` (string, required) - Unique template name (used for programmatic access)
- `displayName` (string, required) - Human-readable template name
- `category` (string, optional) - Template category for organization
- `subject` (string, required) - Email subject line (supports variables)
- `htmlContent` (string, required) - HTML content of the email
- `textContent` (string, optional) - Plain text version
- `variables` (array, optional) - Array of variable names used in the template
- `description` (string, optional) - Template description
- `isActive` (boolean, optional) - Whether template is active (default: true)

#### Response
```json
{
  "id": "template_id",
  "name": "welcome_email",
  "displayName": "Welcome Email",
  "category": "onboarding",
  "subject": "Welcome to {{company_name}}!",
  "htmlContent": "<h1>Welcome {{user_name}}!</h1><p>Thank you for joining {{company_name}}.</p>",
  "textContent": "Welcome {{user_name}}! Thank you for joining {{company_name}}.",
  "variables": ["user_name", "company_name"],
  "description": "Welcome email sent to new users",
  "isActive": true,
  "createdAt": "2024-01-01T12:00:00.000Z",
  "updatedAt": "2024-01-01T12:00:00.000Z"
}
```

### 10. Get All Email Templates
**GET** `/email-templates`

#### Description
Retrieves all email templates, optionally filtered by category.

#### Query Parameters
- `category` (string, optional) - Filter templates by category

#### Response
```json
[
  {
    "id": "template_id",
    "name": "welcome_email",
    "displayName": "Welcome Email",
    "category": "onboarding",
    "subject": "Welcome to {{company_name}}!",
    "description": "Welcome email sent to new users",
    "isActive": true,
    "createdAt": "2024-01-01T12:00:00.000Z",
    "updatedAt": "2024-01-01T12:00:00.000Z"
  }
]
```

### 11. Get Template Categories
**GET** `/email-templates/categories`

#### Description
Returns all available template categories.

#### Response
```json
{
  "categories": [
    "onboarding",
    "marketing",
    "notifications",
    "system"
  ]
}
```

### 12. Get Template by Name
**GET** `/email-templates/by-name/:name`

#### Description
Retrieves a template by its unique name.

#### URL Parameters
- `name` (string) - Template name

#### Response
```json
{
  "id": "template_id",
  "name": "welcome_email",
  "displayName": "Welcome Email",
  "category": "onboarding",
  "subject": "Welcome to {{company_name}}!",
  "htmlContent": "<h1>Welcome {{user_name}}!</h1><p>Thank you for joining {{company_name}}.</p>",
  "textContent": "Welcome {{user_name}}! Thank you for joining {{company_name}}.",
  "variables": ["user_name", "company_name"],
  "description": "Welcome email sent to new users",
  "isActive": true,
  "createdAt": "2024-01-01T12:00:00.000Z",
  "updatedAt": "2024-01-01T12:00:00.000Z"
}
```

### 13. Get Single Email Template
**GET** `/email-templates/:id`

#### Description
Retrieves a specific email template by ID.

#### URL Parameters
- `id` (string) - Template ID

#### Response
Same as template by name response.

### 14. Update Email Template
**PATCH** `/email-templates/:id`

#### Description
Updates an existing email template.

#### Required Roles
- `ADMIN`

#### Request Body
```json
{
  "displayName": "Updated Welcome Email",
  "subject": "Welcome to our amazing platform, {{user_name}}!",
  "htmlContent": "<h1>Hello {{user_name}}!</h1><p>Welcome to {{company_name}}. We're excited to have you!</p>"
}
```

#### Response
Same as create template response with updated fields.

### 15. Delete Email Template
**DELETE** `/email-templates/:id`

#### Description
Permanently deletes an email template.

#### Required Roles
- `ADMIN`

#### Response
```json
{
  "message": "Email template deleted successfully",
  "deletedTemplate": {
    "id": "template_id",
    "name": "welcome_email"
  }
}
```

### 16. Activate Email Template
**POST** `/email-templates/:id/activate`

#### Description
Activates an email template.

#### Required Roles
- `ADMIN`

#### Response
```json
{
  "message": "Template activated successfully",
  "template": {
    "id": "template_id",
    "name": "welcome_email",
    "isActive": true
  }
}
```

### 17. Deactivate Email Template
**POST** `/email-templates/:id/deactivate`

#### Description
Deactivates an email template.

#### Required Roles
- `ADMIN`

#### Response
```json
{
  "message": "Template deactivated successfully",
  "template": {
    "id": "template_id",
    "name": "welcome_email",
    "isActive": false
  }
}
```

### 18. Render Email Template
**POST** `/email-templates/:id/render`

#### Description
Renders a template with provided variables.

#### Request Body
```json
{
  "variables": {
    "user_name": "John Doe",
    "company_name": "Acme Corp"
  }
}
```

#### Response
```json
{
  "rendered": {
    "subject": "Welcome to Acme Corp!",
    "htmlContent": "<h1>Welcome John Doe!</h1><p>Thank you for joining Acme Corp.</p>",
    "textContent": "Welcome John Doe! Thank you for joining Acme Corp."
  }
}
```

### 19. Render Template by Name
**POST** `/email-templates/render-by-name/:name`

#### Description
Renders a template by name with provided variables.

#### URL Parameters
- `name` (string) - Template name

#### Request Body
Same as render template.

#### Response
Same as render template.

### 20. Preview Email Template
**POST** `/email-templates/:id/preview`

#### Description
Generates a preview of the email template.

#### Request Body
```json
{
  "variables": {
    "user_name": "John Doe",
    "company_name": "Acme Corp"
  }
}
```

#### Response
```json
{
  "preview": {
    "subject": "Welcome to Acme Corp!",
    "htmlContent": "<h1>Welcome John Doe!</h1><p>Thank you for joining Acme Corp.</p>",
    "textContent": "Welcome John Doe! Thank you for joining Acme Corp.",
    "previewUrl": "data:text/html;base64,..."
  }
}
```

### 21. Validate Email Template
**POST** `/email-templates/validate`

#### Description
Validates template content and variables.

#### Required Roles
- `ADMIN`

#### Request Body
```json
{
  "htmlContent": "<h1>Welcome {{user_name}}!</h1>",
  "textContent": "Welcome {{user_name}}!",
  "variables": ["user_name", "company_name"]
}
```

#### Response
```json
{
  "isValid": true,
  "errors": [],
  "warnings": ["Variable 'company_name' declared but not used in content"],
  "detectedVariables": ["user_name"],
  "missingVariables": []
}
```

---

# SMTP Configuration Management

## Base URL
```
http://localhost:4000/smtp
```

### 22. Create SMTP Configuration
**POST** `/smtp`

#### Description
Creates a new SMTP configuration for sending emails.

#### Required Roles
- `ADMIN`

#### Request Body
```json
{
  "name": "Gmail SMTP",
  "host": "smtp.gmail.com",
  "port": 587,
  "secure": false,
  "user": "noreply@company.com",
  "pass": "app_password",
  "from": "noreply@company.com",
  "fromName": "Company Name",
  "isActive": true,
  "isDefault": false
}
```

#### Request Body Fields
- `name` (string, required) - Configuration name
- `host` (string, required) - SMTP server host
- `port` (number, required) - SMTP server port
- `secure` (boolean, required) - Use SSL/TLS
- `user` (string, required) - SMTP username
- `pass` (string, required) - SMTP password (will be encrypted)
- `from` (string, required) - From email address
- `fromName` (string, optional) - From name
- `isActive` (boolean, optional) - Active status (default: true)
- `isDefault` (boolean, optional) - Default configuration (default: false)

#### Response
```json
{
  "id": "smtp_config_id",
  "name": "Gmail SMTP",
  "host": "smtp.gmail.com",
  "port": 587,
  "secure": false,
  "user": "noreply@company.com",
  "from": "noreply@company.com",
  "fromName": "Company Name",
  "isActive": true,
  "isDefault": false,
  "createdAt": "2024-01-01T12:00:00.000Z",
  "updatedAt": "2024-01-01T12:00:00.000Z"
}
```

### 23. Get All SMTP Configurations
**GET** `/smtp`

#### Description
Retrieves all SMTP configurations (passwords are masked).

#### Required Roles
- `ADMIN`

#### Response
```json
[
  {
    "id": "smtp_config_id",
    "name": "Gmail SMTP",
    "host": "smtp.gmail.com",
    "port": 587,
    "secure": false,
    "user": "noreply@company.com",
    "pass": "***masked***",
    "from": "noreply@company.com",
    "fromName": "Company Name",
    "isActive": true,
    "isDefault": false,
    "createdAt": "2024-01-01T12:00:00.000Z",
    "updatedAt": "2024-01-01T12:00:00.000Z"
  }
]
```

### 24. Get Active SMTP Configuration
**GET** `/smtp/active`

#### Description
Returns the currently active SMTP configuration.

#### Required Roles
- `ADMIN`

#### Response
Same as single SMTP configuration response.

### 25. Get Default SMTP Configuration
**GET** `/smtp/default`

#### Description
Returns the default SMTP configuration.

#### Required Roles
- `ADMIN`

#### Response
Same as single SMTP configuration response.

### 26. Get Single SMTP Configuration
**GET** `/smtp/:id`

#### Description
Retrieves a specific SMTP configuration.

#### Required Roles
- `ADMIN`

#### Response
Same as create SMTP configuration response.

### 27. Update SMTP Configuration
**PATCH** `/smtp/:id`

#### Description
Updates an existing SMTP configuration.

#### Required Roles
- `ADMIN`

#### Request Body
```json
{
  "name": "Updated Gmail SMTP",
  "fromName": "Updated Company Name",
  "isActive": true
}
```

#### Response
Same as create SMTP configuration response with updated fields.

### 28. Delete SMTP Configuration
**DELETE** `/smtp/:id`

#### Description
Permanently deletes an SMTP configuration.

#### Required Roles
- `ADMIN`

#### Response
```json
{
  "message": "SMTP configuration deleted successfully",
  "deletedId": "smtp_config_id"
}
```

### 29. Activate SMTP Configuration
**POST** `/smtp/:id/activate`

#### Description
Activates an SMTP configuration (deactivates others).

#### Required Roles
- `ADMIN`

#### Response
```json
{
  "message": "SMTP configuration activated successfully",
  "activeConfig": {
    "id": "smtp_config_id",
    "name": "Gmail SMTP",
    "isActive": true
  }
}
```

### 30. Set as Default SMTP Configuration
**POST** `/smtp/:id/set-default`

#### Description
Sets an SMTP configuration as the default.

#### Required Roles
- `ADMIN`

#### Response
```json
{
  "message": "SMTP configuration set as default successfully",
  "defaultConfig": {
    "id": "smtp_config_id",
    "name": "Gmail SMTP",
    "isDefault": true
  }
}
```

### 31. Test SMTP Configuration
**POST** `/smtp/:id/test`

#### Description
Tests an SMTP configuration by sending a test email.

#### Required Roles
- `ADMIN`

#### Request Body
```json
{
  "testEmail": "admin@company.com",
  "subject": "SMTP Test",
  "message": "This is a test email to verify SMTP configuration."
}
```

#### Response
```json
{
  "success": true,
  "message": "Test email sent successfully",
  "details": {
    "to": "admin@company.com",
    "subject": "SMTP Test",
    "sentAt": "2024-01-01T15:30:00.000Z"
  }
}
```

---

# Website Configuration Management (CMS)

## Base URL
```
http://localhost:4000/cms
```

### 32. Get Website Configuration
**GET** `/cms/config`

#### Description
Retrieves the current website configuration.

#### Required Roles
- `ADMIN`
- `EMPLOYEE`

#### Response
```json
{
  "id": "config_id",
  "logoUrl": "https://company.com/logo.png",
  "whatsapp": "+5511999999999",
  "clientsCounter": "500+",
  "counterText": "Satisfied Clients",
  "heroTitle": "Transform Your Business",
  "heroSubtitle": "Digital Marketing Solutions",
  "heroDescription": "We help businesses grow through innovative digital marketing strategies.",
  "processTitle": "Our Process",
  "processButtonText": "Get Started",
  "processButtonLink": "https://company.com/contact",
  "videoTitle": "See How We Work",
  "videoButtonText": "Watch Video",
  "videoButtonLink": "https://youtube.com/watch?v=abc123",
  "videoUrl": "https://youtube.com/embed/abc123",
  "videoPosterUrl": "https://company.com/video-poster.jpg",
  "faqTitle": "Frequently Asked Questions",
  "footerText": "Your trusted digital marketing partner",
  "footerCopyright": "© 2024 Company Name. All rights reserved.",
  "instagramLink": "https://instagram.com/company",
  "twitterLink": "https://twitter.com/company",
  "facebookLink": "https://facebook.com/company",
  "updatedAt": "2024-01-01T12:00:00.000Z",
  "updatedBy": "admin_user_id"
}
```

### 33. Update Website Configuration
**PUT** `/cms/config`

#### Description
Updates the website configuration.

#### Required Roles
- `ADMIN`

#### Request Body
```json
{
  "logoUrl": "https://company.com/new-logo.png",
  "heroTitle": "Transform Your Business Today",
  "heroDescription": "Updated description of our services and value proposition.",
  "whatsapp": "+5511888888888",
  "clientsCounter": "600+",
  "footerCopyright": "© 2024 Updated Company Name. All rights reserved."
}
```

#### Response
Same as get website configuration response with updated fields.

### 34. Get Public Website Configuration
**GET** `/cms/config/public`

#### Description
Retrieves public website configuration (no authentication required).

#### Response
Same as get website configuration but accessible without authentication.

---

# Favicon Management Endpoints

## 35. Upload Favicon
**POST** `/cms/favicon`

#### Description
Uploads a new favicon for the website. Supports ICO, PNG, JPEG, JPG and SVG formats.

#### Required Roles
- `ADMIN`

#### Request Body
Form data with file upload:
- `favicon` (file) - Favicon file (max 2MB)

#### Response
```json
{
  "message": "Favicon uploaded successfully",
  "faviconUrl": "/uploads/favicon/favicon-12345.ico",
  "config": {
    "id": "config_id",
    "faviconUrl": "/uploads/favicon/favicon-12345.ico",
    "siteName": "My Website",
    "updatedAt": "2024-01-01T12:00:00.000Z"
  }
}
```

## 36. Get Current Favicon
**GET** `/cms/favicon`

#### Description
Retrieves the current favicon URL.

#### Response
```json
{
  "faviconUrl": "/uploads/favicon/favicon-12345.ico"
}
```

## 37. Remove Favicon
**DELETE** `/cms/favicon`

#### Description
Removes the current favicon from the website.

#### Required Roles
- `ADMIN`

#### Response
```json
{
  "message": "Favicon removed successfully",
  "config": {
    "id": "config_id",
    "faviconUrl": null,
    "updatedAt": "2024-01-01T12:00:00.000Z"
  }
}
```

# Enhanced Website Configuration

The website configuration now supports additional fields:

### Additional Configuration Fields
- `siteName` (string, optional) - Name of the website
- `supportEmail` (string, optional) - Support email address  
- `siteDescription` (string, optional) - Website description for SEO
- `faviconUrl` (string, optional) - URL to the favicon

### Updated PUT /cms/config Request Body Example
```json
{
  "siteName": "Nerdzup Marketing",
  "supportEmail": "support@nerdzup.com",
  "siteDescription": "Professional marketing services and digital solutions",
  "faviconUrl": "/uploads/favicon/favicon-12345.ico",
  "logoUrl": "https://example.com/logo.png",
  "whatsapp": "+5511999999999",
  "heroTitle": "Transform Your Business with Digital Marketing",
  "heroSubtitle": "Professional marketing solutions that deliver results",
  "heroDescription": "We help businesses grow through strategic digital marketing campaigns and creative solutions."
}
```

---

## Error Codes

### Common HTTP Status Codes
- `200` - Success
- `201` - Created
- `204` - No Content (for successful deletions)
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `500` - Internal Server Error

### Security Notes
- All API key values are encrypted in the database
- SMTP passwords are encrypted
- Only admins can manage system configurations
- Sensitive data is masked in API responses
- All actions are logged for audit purposes
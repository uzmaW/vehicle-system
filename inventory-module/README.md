# Multi-Tenant Inventory Management Module

A comprehensive inventory management system built using **Modular Monolith Architecture** with **Clean Architecture** principles. This module manages dealers and their vehicle inventory with robust multi-tenant data isolation and role-based authentication.

## Architecture Overview

### Modular Monolith Approach

This implementation follows the modular monolith paradigm, which provides:

- **Deployment Simplicity**: Single deployable artifact
- **Organizational Scalability**: Clear module boundaries
- **ACID Transactions**: Within module boundaries
- **Future Extraction Path**: Ready for microservices migration

### Clean Architecture Layers

```
┌─────────────────────────────────────────────────────────────┐
│                    Presentation Layer                        │
│                    (REST Controllers & Angular Frontend)     │
├─────────────────────────────────────────────────────────────┤
│                    Application Layer                         │
│                    (Services & DTOs)                         │
├─────────────────────────────────────────────────────────────┤
│                      Domain Layer                            │
│              (Entities, Enums & Authentication)              │
├─────────────────────────────────────────────────────────────┤
│                   Infrastructure Layer                       │
│                 (Repositories & Configuration)               │
└─────────────────────────────────────────────────────────────┘
```

### Authentication Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Tenant Filter                           │
│        (Extract X-Tenant-Id from request headers)            │
├─────────────────────────────────────────────────────────────┤
│                      User Context                            │
│        (ThreadLocal storage: UserId, Email, Role)            │
├─────────────────────────────────────────────────────────────┤
│                   Security Layers                            │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────┐   │
│  │  TenantId   │  │  UserRole    │  │  Authentication   │   │
│  │  Validation │  │  Validation  │  │  (JWT Token)      │   │
│  └─────────────┘  └──────────────┘  └────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Role-Based Access Control

The system implements a three-tier role hierarchy:
- **STANDARD**: Basic user with tenant-specific access
- **TENANT_ADMIN**: Tenant administrator with full tenant permissions
- **GLOBAL_ADMIN**: Platform-wide administrator with all access

## Project Structure

```
inventory-module/
├── backend/                          # Spring Boot Application
│   ├── src/main/java/com/inventory/module/
│   │   ├── config/                   # Configuration classes
│   │   │   ├── SecurityConfig.java
│   │   │   └── TenantAwareRepositoryAspect.java
│   │   ├── controllers/              # REST Controllers
│   │   │   ├── AdminController.java
│   │   │   ├── DealerController.java
│   │   │   └── VehicleController.java
│   │   ├── domain/                   # Domain Entities
│   │   │   ├── Dealer.java
│   │   │   ├── Vehicle.java
│   │   │   ├── SubscriptionType.java
│   │   │   └── VehicleStatus.java
│   │   ├── dto/                      # Data Transfer Objects
│   │   ├── exception/                # Exception handling
│   │   ├── repositories/             # JPA Repositories
│   │   ├── security/                 # Security & Tenant context
│   │   └── services/                 # Business logic
│   └── src/main/resources/
│       └── application.yml
│
└── frontend/                         # Angular Application
    └── src/app/
        ├── components/
        │   ├── dealer-list/
        │   ├── vehicle-list/
        │   └── admin-dashboard/
        ├── interceptors/
        ├── models/
        └── services/
```

## Data Model

### Tenant Entity

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Globally unique identifier |
| name | String | Business name |
| email | String | Contact email (unique across all tenants) |
| subscriptionType | Enum | BASIC or PREMIUM |
| createdAt | Instant | Creation timestamp |
| updatedAt | Instant | Last update timestamp |

### Dealer Entity

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Globally unique identifier |
| tenantId | UUID | Foreign key to Tenant (tenant-aware) |
| name | String | Business name |
| email | String | Contact email (unique within tenant) |
| subscriptionType | Enum | BASIC or PREMIUM |

### Vehicle Entity

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Globally unique identifier |
| tenantId | UUID | Foreign key to Tenant (tenant-aware) |
| dealerId | UUID | Foreign key to Dealer |
| model | String | Vehicle model name |
| price | Decimal | List price |
| status | Enum | AVAILABLE or SOLD |

## Multi-Tenancy Implementation

### Strategy: Composite Unique Constraints

Tables use a combination of tenant_id with unique constraints for proper isolation:

```sql
-- Tenant-aware unique constraints
ALTER TABLE tenants ADD CONSTRAINT uk_tenant_uuid UNIQUE (uuid, tenant_id);
ALTER TABLE tenants ADD CONSTRAINT uk_tenant_email UNIQUE (email, tenant_id);

-- Automatic tenant filtering in all queries
SELECT * FROM vehicles WHERE tenant_id = :tenantId AND dealer_id = :dealerId
```

### Security Architecture

1. **Tenant Filter**: Extracts and validates `X-Tenant-Id` header from requests
2. **User Context**: ThreadLocal storage for UserId, Email, and Role
3. **Hibernate Filters**: ORM-level automatic tenant scoping
4. **Service Validation**: Business logic tenant verification
5. **Authentication Layer**: JWT-based authentication with role claims

### Tenant Context Lifecycle

```
Request → TenantFilter → Extract X-Tenant-Id & X-User-Role → Validate → Store in ThreadLocal
    ↓
Service Layer → Access TenantContext (UserId, Email, Role)
    ↓
Repository → Hibernate Filter + Row-Level Security → Tenant-isolated queries
    ↓
Response → Clear ThreadLocal (prevent context leakage)
```

### Authentication Flow

```
Client → Login (Email/Password) → JWT Token Issuance → API Request (with Token)
    ↓
TenantFilter → Validate TenantId → UserContext.setUserContext() → Proceed to Service
```

### User Roles and Permissions

- **STANDARD**: Can access tenant-specific resources
- **TENANT_ADMIN**: Can manage all entities within tenant + user management
- **GLOBAL_ADMIN**: Can access all tenants + manage platform configuration

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/login` | Authenticate user and get JWT token |
| POST | `/auth/logout` | Invalidate JWT token |
| GET | `/auth/validate` | Validate current token and get user info |

### Dealer Endpoints

| Method | Endpoint | Role Required | Description |
|--------|----------|---------------|-------------|
| POST | `/dealers` | STANDARD | Create a new dealer within tenant |
| GET | `/dealers/{id}` | STANDARD | Get dealer by ID (tenant-scoped) |
| GET | `/dealers` | STANDARD | List dealers (paginated, tenant-scoped) |
| PATCH | `/dealers/{id}` | TENANT_ADMIN | Update dealer |
| DELETE | `/dealers/{id}` | TENANT_ADMIN | Delete dealer |

### Vehicle Endpoints

| Method | Endpoint | Role Required | Description |
|--------|----------|---------------|-------------|
| POST | `/vehicles` | STANDARD | Create a new vehicle within tenant |
| GET | `/vehicles/{id}` | STANDARD | Get vehicle by ID (tenant-scoped) |
| GET | `/vehicles` | STANDARD | List vehicles with filters (tenant-scoped) |
| PATCH | `/vehicles/{id}` | TENANT_ADMIN | Update vehicle |
| DELETE | `/vehicles/{id}` | TENANT_ADMIN | Delete vehicle |

#### Vehicle Search Filters

```
GET /vehicles?model=Toyota&status=AVAILABLE&priceMin=10000&priceMax=30000&subscription=PREMIUM
```

All searches are automatically scoped to the authenticated tenant.

### Admin Endpoints

| Method | Endpoint | Role Required | Description |
|--------|----------|---------------|-------------|
| GET | `/admin/dealers/countBySubscription` | GLOBAL_ADMIN | Platform-wide dealer statistics |
| GET | `/admin/tenants` | GLOBAL_ADMIN | List all tenants (metadata only) |
| POST | `/admin/tenants/{id}/users` | GLOBAL_ADMIN | Manage tenant users |

**Response:**
```json
{
  "basic": 150,
  "premium": 45
}
```

**Note:** These counts are **platform-wide statistics** across all tenants. Tenant-specific data requires authentication with proper tenant context.

## Error Handling

| HTTP Status | Error Code | Scenario |
|-------------|------------|----------|
| 400 | MISSING_TENANT_HEADER | X-Tenant-Id header missing |
| 403 | CROSS_TENANT_ACCESS | Accessing another tenant's data |
| 404 | ENTITY_NOT_FOUND | Resource not in tenant scope |
| 422 | VALIDATION_ERROR | Business rule violation |

## Getting Started

### Prerequisites

- Java 17+
- Node.js 18+
- Maven 3.8+
- PostgreSQL (recommended for production)

### Backend Setup

```bash
cd inventory-module/backend

# Build and run
mvn spring-boot:run

# Or with jar
mvn package
java -jar target/inventory-module-1.0.0.jar
```

The backend will start at `http://localhost:8080`

### Frontend Setup

```bash
cd inventory-module/frontend

# Install dependencies
npm install

# Development server
npm start
```

The frontend will start at `http://localhost:4200`

### Environment Configuration

```bash
# Set environment variables for production
export DB_URL=postgresql://user:password@localhost:5432/inventory
export DB_USERNAME=app_user
export DB_PASSWORD=secure_password
export SERVER_PORT=8080
```

### Using the Application

1. Open the frontend in your browser
2. Login with your email and password (admin credentials may be pre-configured)
3. The system will automatically detect and validate your tenant context
4. Navigate to Dealers or Vehicles to manage inventory

## Testing Multi-Tenancy

### Scenario 1: Missing Tenant Header

```bash
curl -X GET http://localhost:8080/dealers
# Response: 400 Bad Request - "Missing required header: X-Tenant-Id"
```

### Scenario 2: Cross-Tenant Access

```bash
# Create dealer in tenant A
curl -X POST http://localhost:8080/dealers \
  -H "X-Tenant-Id: tenant-a-uuid" \
  -H "Content-Type: application/json" \
  -d '{"name":"Dealer A","email":"a@test.com","subscriptionType":"BASIC"}'

# Try to access from tenant B (will return 404 - not found in tenant scope)
curl -X GET http://localhost:8080/dealers/{dealer-id} \
  -H "X-Tenant-Id: tenant-b-uuid"
```

### Scenario 3: Subscription-Based Vehicle Query

```bash
# Get vehicles from PREMIUM dealers only
curl -X GET "http://localhost:8080/vehicles?subscription=PREMIUM" \
  -H "X-Tenant-Id: your-tenant-uuid"
```

### Scenario 4: Admin Global Statistics

```bash
# Get platform-wide dealer counts
curl -X GET http://localhost:8080/admin/dealers/countBySubscription \
  -H "X-Tenant-Id: any-tenant" \
  -H "X-User-Role: GLOBAL_ADMIN"
```

## Key Implementation Details

### Hibernate Filter for Tenant Isolation

```java
@FilterDef(name = "tenantFilter", parameters = @ParamDef(name = "tenantId", type = String.class))
@Filter(name = "tenantFilter", condition = "tenant_id = :tenantId")
public class Dealer { ... }
```

### Tenant Context Propagation

```java
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class TenantFilter implements Filter {
    @Override
    public void doFilter(...) {
        try {
            String tenantId = extractTenantId(request);
            TenantContext.setTenantId(tenantId);
            chain.doFilter(request, response);
        } finally {
            TenantContext.clear(); // Prevent context leakage
        }
    }
}
```

### Subscription-Based Query

```java
@Query("""
    SELECT v FROM Vehicle v 
    INNER JOIN v.dealer d 
    WHERE v.tenantId = :tenantId 
    AND d.tenantId = :tenantId 
    AND d.subscriptionType = :subscriptionType
    """)
Page<Vehicle> findByDealerSubscriptionType(...);
```

## Security Considerations

1. **Tenant Header Validation**: UUID format validation prevents injection
2. **Redundant Filtering**: Both vehicle and dealer tenant_id checked in joins
3. **Context Cleanup**: ThreadLocal cleared after every request
4. **Admin Role Verification**: Server-side role check for admin endpoints

## Future Evolution

This modular design supports extraction to microservices:

1. **Schema Isolation**: Tables already tenant-aware
2. **Clean Boundaries**: Module has explicit public API
3. **Independent Deployment**: Can be extracted with minimal refactoring

## License

MIT License
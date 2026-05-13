# Setup Guide

## Backend Setup (Spring Boot)

### Prerequisites
- Java 17 or higher
- Maven 3.8 or higher

### Installation Steps

1. **Navigate to backend directory:**
   ```bash
   cd inventory-module/backend
   ```

2. **Build the project:**
   ```bash
   mvn clean install
   ```

3. **Run the application:**
   ```bash
   mvn spring-boot:run
   ```

   The application will start on `http://localhost:8080`

4. **Access H2 Console (for database inspection):**
   - URL: `http://localhost:8080/h2-console`
   - JDBC URL: `jdbc:h2:mem:inventorydb`
   - Username: `sa`
   - Password: (leave empty)

### Configuration

Edit `src/main/resources/application.yml` to customize:
- Server port
- Database settings
- Logging levels

## Frontend Setup (Angular)

### Prerequisites
- Node.js 18 or higher
- npm 9 or higher

### Installation Steps

1. **Navigate to frontend directory:**
   ```bash
   cd inventory-module/frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run development server:**
   ```bash
   npm start
   ```

   The application will start on `http://localhost:4200`

4. **Build for production:**
   ```bash
   npm run build
   ```

   The build output will be in `dist/` directory

### Configuration

The frontend connects to the backend at `http://localhost:8080` by default.
To change this, update the `baseUrl` in `src/app/services/api.service.ts`.

## Quick Start with Sample Data

### 1. Start the Backend
```bash
cd inventory-module/backend
mvn spring-boot:run
```

### 2. Start the Frontend
```bash
cd inventory-module/frontend
npm start
```

### 3. Configure Tenant Context
1. Open `http://localhost:4200` in your browser
2. Click "Settings" in the header
3. Enter a Tenant ID (e.g., `550e8400-e29b-41d4-a716-446655440000`)
4. Set User Role to `STANDARD` or `GLOBAL_ADMIN`

### 4. Create Sample Dealers
```bash
# Create a BASIC dealer
curl -X POST http://localhost:8080/dealers \
  -H "X-Tenant-Id: 550e8400-e29b-41d4-a716-446655440000" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Auto World",
    "email": "sales@autoworld.com",
    "subscriptionType": "BASIC"
  }'

# Create a PREMIUM dealer
curl -X POST http://localhost:8080/dealers \
  -H "X-Tenant-Id: 550e8400-e29b-41d4-a716-446655440000" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Premium Motors",
    "email": "info@premiummotors.com",
    "subscriptionType": "PREMIUM"
  }'
```

### 5. Create Sample Vehicles
```bash
# Add vehicles to dealers (replace {dealer-id} with actual IDs from step 4)
curl -X POST http://localhost:8080/vehicles \
  -H "X-Tenant-Id: 550e8400-e29b-41d4-a716-446655440000" \
  -H "Content-Type: application/json" \
  -d '{
    "dealerId": "{dealer-id}",
    "model": "Toyota Camry",
    "price": 25000,
    "status": "AVAILABLE"
  }'
```

## Testing Multi-Tenancy

### Test 1: Missing Tenant Header
```bash
curl -X GET http://localhost:8080/dealers
# Expected: 400 Bad Request - "Missing required header: X-Tenant-Id"
```

### Test 2: Cross-Tenant Isolation
```bash
# Create dealer in Tenant A
curl -X POST http://localhost:8080/dealers \
  -H "X-Tenant-Id: tenant-a-uuid" \
  -H "Content-Type: application/json" \
  -d '{"name":"Dealer A","email":"a@test.com","subscriptionType":"BASIC"}'

# Try to access from Tenant B
curl -X GET http://localhost:8080/dealers \
  -H "X-Tenant-Id: tenant-b-uuid"
# Expected: Empty list (dealer from Tenant A not visible)
```

### Test 3: Subscription-Based Filtering
```bash
# Get vehicles from PREMIUM dealers only
curl -X GET "http://localhost:8080/vehicles?subscription=PREMIUM" \
  -H "X-Tenant-Id: 550e8400-e29b-41d4-a716-446655440000"
```

### Test 4: Admin Global Statistics
```bash
# Get platform-wide dealer counts (requires GLOBAL_ADMIN role)
curl -X GET http://localhost:8080/admin/dealers/countBySubscription \
  -H "X-Tenant-Id: any-tenant" \
  -H "X-User-Role: GLOBAL_ADMIN"
# Expected: {"basic": n, "premium": n} (counts across ALL tenants)
```

## Troubleshooting

### Backend Issues

**Problem:** Port 8080 already in use
```bash
# Change port in application.yml
server:
  port: 8081
```

**Problem:** Database connection issues
- Check H2 console is accessible
- Verify database URL in application.yml

### Frontend Issues

**Problem:** Cannot connect to backend
- Verify backend is running on port 8080
- Check browser console for CORS errors
- Update `baseUrl` in api.service.ts if backend is on different port

**Problem:** npm install fails
```bash
# Clear npm cache and retry
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

## Development Tips

### Backend Development
- Use H2 console for database inspection during development
- Enable SQL logging in application.yml to see generated queries
- Use Postman or curl for API testing

### Frontend Development
- Angular DevTools browser extension for debugging
- Use browser DevTools Network tab to inspect API calls
- Check Console for JavaScript errors

## Production Deployment

### Backend
1. Build executable JAR: `mvn clean package`
2. Configure production database (PostgreSQL, MySQL, etc.)
3. Update application.yml with production settings
4. Deploy JAR to server or container

### Frontend
1. Build for production: `npm run build`
2. Serve static files with nginx or similar
3. Configure reverse proxy to backend API
4. Enable HTTPS and security headers

## Support

For issues or questions:
1. Check the main README.md for architecture details
2. Review API endpoint documentation
3. Check application logs for error messages
import XCTest
@testable import InventoryApp

final class TenantModelTests: XCTestCase {
    
    func testTenantRegisterRequestEncoding() throws {
        let request = TenantRegisterRequest(
            name: "Test Company",
            domain: "test.com",
            adminEmail: "admin@test.com",
            adminPassword: "password123",
            adminName: "Admin User"
        )
        
        let encoder = JSONEncoder()
        let data = try encoder.encode(request)
        let json = String(data: data, encoding: .utf8)!
        
        XCTAssertTrue(json.contains("Test Company"))
        XCTAssertTrue(json.contains("test.com"))
        XCTAssertTrue(json.contains("admin@test.com"))
    }
    
    func testTenantDecoding() throws {
        let json = """
        {
            "id": 1,
            "uuid": "tenant-uuid-123",
            "name": "Test Company",
            "domain": "test.com",
            "active": true,
            "createdAt": "2024-01-01T00:00:00Z",
            "updatedAt": "2024-01-01T00:00:00Z"
        }
        """
        
        let data = json.data(using: .utf8)!
        let decoder = JSONDecoder()
        let tenant = try decoder.decode(Tenant.self, from: data)
        
        XCTAssertEqual(tenant.uuid, "tenant-uuid-123")
        XCTAssertEqual(tenant.name, "Test Company")
        XCTAssertEqual(tenant.domain, "test.com")
        XCTAssertTrue(tenant.active)
    }
}
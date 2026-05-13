import XCTest
@testable import InventoryApp

final class UserModelTests: XCTestCase {
    
    func testUserRoleRawValues() {
        XCTAssertEqual(UserRole.STANDARD.rawValue, "STANDARD")
        XCTAssertEqual(UserRole.TENANT_ADMIN.rawValue, "TENANT_ADMIN")
        XCTAssertEqual(UserRole.GLOBAL_ADMIN.rawValue, "GLOBAL_ADMIN")
    }
    
    func testUserRoleAllCasesCount() {
        XCTAssertEqual(UserRole.allCases.count, 3)
    }
    
    func testLoginRequestEncoding() throws {
        let request = LoginRequest(email: "test@example.com", password: "password123")
        
        let encoder = JSONEncoder()
        let data = try encoder.encode(request)
        let json = String(data: data, encoding: .utf8)
        
        XCTAssertTrue(json?.contains("test@example.com") ?? false)
        XCTAssertTrue(json?.contains("password123") ?? false)
    }
    
    func testLoginResponseDecoding() throws {
        let json = """
        {
            "token": "test-token",
            "tokenType": "Bearer",
            "expiresIn": 86400,
            "userId": "user-123",
            "email": "test@example.com",
            "tenantId": "tenant-456",
            "role": "TENANT_ADMIN"
        }
        """
        
        let data = json.data(using: .utf8)!
        let decoder = JSONDecoder()
        let response = try decoder.decode(LoginResponse.self, from: data)
        
        XCTAssertEqual(response.token, "test-token")
        XCTAssertEqual(response.tokenType, "Bearer")
        XCTAssertEqual(response.expiresIn, 86400)
        XCTAssertEqual(response.userId, "user-123")
        XCTAssertEqual(response.email, "test@example.com")
        XCTAssertEqual(response.tenantId, "tenant-456")
        XCTAssertEqual(response.role, .TENANT_ADMIN)
    }
}
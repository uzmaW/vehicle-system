import XCTest
@testable import InventoryApp

final class AuthServiceTests: XCTestCase {
    
    func testLoginRequestEncoding() {
        let request = LoginRequest(email: "test@example.com", password: "password")
        
        let encoder = JSONEncoder()
        guard let data = try? encoder.encode(request),
              let json = String(data: data, encoding: .utf8) else {
            XCTFail("Failed to encode request")
            return
        }
        
        XCTAssertTrue(json.contains("test@example.com"))
        XCTAssertTrue(json.contains("password"))
    }
    
    func testLoginResponseParsing() {
        let jsonString = """
        {
            "token": "jwt-token",
            "tokenType": "Bearer",
            "expiresIn": 86400,
            "userId": "user-123",
            "email": "test@example.com",
            "tenantId": "tenant-456",
            "role": "STANDARD"
        }
        """
        
        guard let data = jsonString.data(using: .utf8) else {
            XCTFail("Failed to create data from json string")
            return
        }
        
        let decoder = JSONDecoder()
        guard let response = try? decoder.decode(LoginResponse.self, from: data) else {
            XCTFail("Failed to decode response")
            return
        }
        
        XCTAssertEqual(response.token, "jwt-token")
        XCTAssertEqual(response.tokenType, "Bearer")
        XCTAssertEqual(response.expiresIn, 86400)
        XCTAssertEqual(response.userId, "user-123")
        XCTAssertEqual(response.email, "test@example.com")
        XCTAssertEqual(response.tenantId, "tenant-456")
        XCTAssertEqual(response.role, .STANDARD)
    }
}
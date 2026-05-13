import XCTest
@testable import InventoryApp

final class DealerModelTests: XCTestCase {
    
    func testDealerCreateRequestEncoding() throws {
        let request = DealerCreateRequest(
            name: "Test Dealer",
            email: "dealer@test.com",
            subscriptionType: .PREMIUM
        )
        
        let encoder = JSONEncoder()
        let data = try encoder.encode(request)
        let json = String(data: data, encoding: .utf8)!
        
        XCTAssertTrue(json.contains("Test Dealer"))
        XCTAssertTrue(json.contains("dealer@test.com"))
        XCTAssertTrue(json.contains("PREMIUM"))
    }
    
    func testDealerDecoding() throws {
        let json = """
        {
            "id": "dealer-uuid-123",
            "tenantId": "tenant-456",
            "name": "Test Dealer",
            "email": "dealer@test.com",
            "subscriptionType": "BASIC",
            "createdAt": "2024-01-01T00:00:00Z",
            "updatedAt": "2024-01-01T00:00:00Z"
        }
        """
        
        let data = json.data(using: .utf8)!
        let decoder = JSONDecoder()
        let dealer = try decoder.decode(Dealer.self, from: data)
        
        XCTAssertEqual(dealer.id, "dealer-uuid-123")
        XCTAssertEqual(dealer.tenantId, "tenant-456")
        XCTAssertEqual(dealer.name, "Test Dealer")
        XCTAssertEqual(dealer.email, "dealer@test.com")
        XCTAssertEqual(dealer.subscriptionType, .BASIC)
    }
    
    func testDealerUpdateRequestPartialEncoding() throws {
        let request = DealerUpdateRequest(name: "Updated Name", email: nil, subscriptionType: .PREMIUM)
        
        let encoder = JSONEncoder()
        let data = try encoder.encode(request)
        let json = String(data: data, encoding: .utf8)!
        
        XCTAssertTrue(json.contains("Updated Name"))
        XCTAssertTrue(json.contains("PREMIUM"))
    }
}
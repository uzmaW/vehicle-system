import XCTest
@testable import InventoryApp

final class VehicleModelTests: XCTestCase {
    
    func testVehicleStatusRawValues() {
        XCTAssertEqual(VehicleStatus.AVAILABLE.rawValue, "AVAILABLE")
        XCTAssertEqual(VehicleStatus.SOLD.rawValue, "SOLD")
    }
    
    func testSubscriptionTypeRawValues() {
        XCTAssertEqual(SubscriptionType.BASIC.rawValue, "BASIC")
        XCTAssertEqual(SubscriptionType.PREMIUM.rawValue, "PREMIUM")
    }
    
    func testVehicleCreateRequestEncoding() throws {
        let request = VehicleCreateRequest(dealerId: "dealer-123", model: "Tesla Model 3", price: 45000.0)
        
        let encoder = JSONEncoder()
        let data = try encoder.encode(request)
        let json = String(data: data, encoding: .utf8)!
        
        XCTAssertTrue(json.contains("dealer-123"))
        XCTAssertTrue(json.contains("Tesla Model 3"))
        XCTAssertTrue(json.contains("45000"))
    }
    
    func testVehicleDecoding() throws {
        let json = """
        {
            "id": "vehicle-uuid-123",
            "dealerId": "dealer-456",
            "dealerName": "Test Dealer",
            "dealerSubscriptionType": "PREMIUM",
            "model": "Tesla Model 3",
            "price": 45000.0,
            "status": "AVAILABLE",
            "createdAt": "2024-01-01T00:00:00Z",
            "updatedAt": "2024-01-01T00:00:00Z"
        }
        """
        
        let data = json.data(using: .utf8)!
        let decoder = JSONDecoder()
        let vehicle = try decoder.decode(Vehicle.self, from: data)
        
        XCTAssertEqual(vehicle.id, "vehicle-uuid-123")
        XCTAssertEqual(vehicle.dealerId, "dealer-456")
        XCTAssertEqual(vehicle.dealerName, "Test Dealer")
        XCTAssertEqual(vehicle.model, "Tesla Model 3")
        XCTAssertEqual(vehicle.price, 45000.0)
        XCTAssertEqual(vehicle.status, .AVAILABLE)
    }
    
    func testVehicleUpdateRequestPartialEncoding() throws {
        let request = VehicleUpdateRequest(model: "Updated Model", price: nil, status: .SOLD)
        
        let encoder = JSONEncoder()
        let data = try encoder.encode(request)
        let json = String(data: data, encoding: .utf8)!
        
        XCTAssertTrue(json.contains("Updated Model"))
        XCTAssertTrue(json.contains("SOLD"))
        XCTAssertFalse(json.contains("\"price\""))
    }
    
    func testPagedResponseDecoding() throws {
        let json = """
        {
            "content": [
                {
                    "id": "vehicle-1",
                    "dealerId": "dealer-1",
                    "dealerName": "Dealer 1",
                    "dealerSubscriptionType": "BASIC",
                    "model": "Car 1",
                    "price": 30000.0,
                    "status": "AVAILABLE",
                    "createdAt": "2024-01-01T00:00:00Z",
                    "updatedAt": "2024-01-01T00:00:00Z"
                }
            ],
            "page": 0,
            "size": 20,
            "totalElements": 1,
            "totalPages": 1
        }
        """
        
        let data = json.data(using: .utf8)!
        let decoder = JSONDecoder()
        let response = try decoder.decode(PagedResponse<Vehicle>.self, from: data)
        
        XCTAssertEqual(response.content.count, 1)
        XCTAssertEqual(response.pageNumber, 0)
        XCTAssertEqual(response.pageSize, 20)
        XCTAssertEqual(response.totalElements, 1)
        XCTAssertEqual(response.totalPages, 1)
    }
}
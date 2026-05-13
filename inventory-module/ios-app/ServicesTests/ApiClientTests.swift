import XCTest
@testable import InventoryApp

final class ApiClientTests: XCTestCase {
    
    func testApiErrorDescriptions() {
        let invalidURLError = ApiError.invalidURL
        XCTAssertEqual(invalidURLError.errorDescription, "Invalid URL")
        
        let invalidResponseError = ApiError.invalidResponse
        XCTAssertEqual(invalidResponseError.errorDescription, "Invalid response")
        
        let httpError = ApiError.httpError(404)
        XCTAssertEqual(httpError.errorDescription, "HTTP error: 404")
        
        let serverError = ApiError.serverError("Not Found")
        XCTAssertEqual(serverError.errorDescription, "Not Found")
    }
    
    func testAnyEncodableConformsToEncodable() {
        let request = LoginRequest(email: "test@example.com", password: "password")
        let anyEncodable = AnyEncodable(request)
        
        let encoder = JSONEncoder()
        guard let data = try? encoder.encode(anyEncodable),
              let json = String(data: data, encoding: .utf8) else {
            XCTFail("Failed to encode AnyEncodable")
            return
        }
        
        XCTAssertTrue(json.contains("test@example.com"))
    }
}
import XCTest
@testable import InventoryApp

final class AuthViewModelTests: XCTestCase {
    
    func testAuthViewModelInitialState() {
        let viewModel = AuthViewModel()
        
        XCTAssertFalse(viewModel.isAuthenticated)
        XCTAssertNil(viewModel.currentUser)
        XCTAssertFalse(viewModel.isLoading)
        XCTAssertNil(viewModel.errorMessage)
    }
    
    func testAuthViewModelCheckAuthWithToken() {
        UserDefaults.standard.set("test-token", forKey: "authToken")
        UserDefaults.standard.set("tenant-123", forKey: "tenantId")
        
        let viewModel = AuthViewModel()
        
        XCTAssertTrue(viewModel.isAuthenticated)
        
        UserDefaults.standard.removeObject(forKey: "authToken")
        UserDefaults.standard.removeObject(forKey: "tenantId")
    }
    
    func testAuthViewModelLogoutClearsState() async {
        UserDefaults.standard.set("test-token", forKey: "authToken")
        UserDefaults.standard.set("tenant-123", forKey: "tenantId")
        
        let viewModel = AuthViewModel()
        
        await viewModel.logout()
        
        XCTAssertFalse(viewModel.isAuthenticated)
        XCTAssertNil(viewModel.currentUser)
        
        UserDefaults.standard.removeObject(forKey: "authToken")
        UserDefaults.standard.removeObject(forKey: "tenantId")
    }
}
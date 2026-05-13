import Foundation

class TenantService {
    static let shared = TenantService()
    private let apiClient = ApiClient.shared
    
    private init() {}
    
    func register(name: String, domain: String, adminEmail: String, adminPassword: String, adminName: String) async throws -> TenantRegisterResponse {
        let request = TenantRegisterRequest(
            name: name,
            domain: domain,
            adminEmail: adminEmail,
            adminPassword: adminPassword,
            adminName: adminName
        )
        return try await apiClient.makeRequest(
            endpoint: "/api/tenants/register",
            method: "POST",
            body: request,
            includeTenant: false
        )
    }
    
    func getTenant() async throws -> Tenant {
        return try await apiClient.makeRequest(
            endpoint: "/api/tenants",
            method: "GET"
        )
    }
}
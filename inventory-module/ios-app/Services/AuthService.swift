import Foundation

class AuthService {
    static let shared = AuthService()
    private let apiClient = ApiClient.shared
    
    private init() {}
    
    func login(email: String, password: String) async throws -> LoginResponse {
        let request = LoginRequest(email: email, password: password)
        let response: LoginResponse = try await apiClient.makeRequest(
            endpoint: "/api/auth/login",
            method: "POST",
            body: request,
            includeTenant: false
        )
        let tokenPreview = String(response.token?.prefix(20) ?? "")
            print("LOGIN RESPONSE - Token: \(tokenPreview), TenantId: \(response.tenantId), Role: \(response.role)")
        return response
    }
    
    func logout() async throws {
        let _: EmptyResponse = try await apiClient.makeRequest(
            endpoint: "/api/auth/logout",
            method: "POST",
            includeTenant: true
        )
        apiClient.clearAuth()
    }
    
    func getCurrentUser() async throws -> LoginResponse {
        return try await apiClient.makeRequest(
            endpoint: "/api/auth/me",
            method: "GET"
        )
    }
}
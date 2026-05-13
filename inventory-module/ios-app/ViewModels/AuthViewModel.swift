import Foundation
import SwiftUI

@MainActor
class AuthViewModel: ObservableObject {
    @Published var isAuthenticated = false
    @Published var currentUser: LoginResponse?
    @Published var isLoading = false
    @Published var errorMessage: String?

    private let authService = AuthService.shared

    init() {
        checkAuth()
    }

    private func checkAuth() {
        if UserDefaults.standard.string(forKey: "authToken") != nil {
            isAuthenticated = true
        }
    }

    func login(email: String, password: String) async {
        isLoading = true
        errorMessage = nil

        let request = LoginRequest(email: email, password: password)

        do {
            let response: LoginResponse = try await ApiClient.shared.makeRequest(
                endpoint: "/api/auth/login",
                method: "POST",
                body: request,
                includeTenant: false
            )

            UserDefaults.standard.set(response.token, forKey: "authToken")
            UserDefaults.standard.set(response.tenantId, forKey: "tenantId")
            UserDefaults.standard.synchronize()

            try? await Task.sleep(nanoseconds: 100_000_000)

            currentUser = response
            isAuthenticated = true
            isLoading = false
        } catch {
            isLoading = false
            errorMessage = error.localizedDescription
        }
    }

    func logout() async {
        isLoading = true

        do {
            try await authService.logout()
        } catch {
            // Ignore logout errors
        }

        ApiClient.shared.clearAuth()

        isAuthenticated = false
        currentUser = nil
        isLoading = false
    }
}
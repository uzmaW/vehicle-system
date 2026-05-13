import Foundation
import SwiftUI

@MainActor
class DealerViewModel: ObservableObject {
    @Published var dealers: [Dealer] = []
    @Published var isLoading = false
    @Published var errorMessage: String?

    private let dealerService = DealerService.shared

    func loadDealers() async {
        isLoading = true
        errorMessage = nil

        var token: String?
        var tenant: String?
        var attempts = 0

        while attempts < 10 {
            token = UserDefaults.standard.string(forKey: "authToken")
            tenant = UserDefaults.standard.string(forKey: "tenantId")

            if token != nil && tenant != nil {
                break
            }
            attempts += 1
            try? await Task.sleep(nanoseconds: 50_000_000)
        }

        guard let validToken = token, let validTenant = tenant else {
            isLoading = false
            errorMessage = "Authentication not persisted. Please login again."
            return
        }

        do {
            let response = try await dealerService.getAllDealers()
            let dealerList = response.content ?? []
            dealers = dealerList
            isLoading = false
        } catch {
            isLoading = false
            errorMessage = "Failed to load dealers: \(error.localizedDescription)"
        }
    }

    func createDealer(name: String, email: String, subscriptionType: SubscriptionType) async {
        isLoading = true

        do {
            _ = try await dealerService.createDealer(name: name, email: email, subscriptionType: subscriptionType)
            await loadDealers()
        } catch {
            isLoading = false
            errorMessage = error.localizedDescription
        }
    }

    func deleteDealer(id: String) async {
        do {
            try await dealerService.deleteDealer(id: id)
            await loadDealers()
        } catch {
            errorMessage = error.localizedDescription
        }
    }
}
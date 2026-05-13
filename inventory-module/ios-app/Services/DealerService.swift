import Foundation

class DealerService {
    static let shared = DealerService()
    private let apiClient = ApiClient.shared
    
    private init() {}
    
    func createDealer(name: String, email: String, subscriptionType: SubscriptionType) async throws -> Dealer {
        let request = DealerCreateRequest(name: name, email: email, subscriptionType: subscriptionType)
        return try await apiClient.makeRequest(
            endpoint: "/dealers",
            method: "POST",
            body: request
        )
    }
    
    func getDealer(id: String) async throws -> Dealer {
        return try await apiClient.makeRequest(
            endpoint: "/dealers/\(id)",
            method: "GET"
        )
    }
    
    func getAllDealers(
        page: Int = 0,
        size: Int = 20,
        sortBy: String = "createdAt",
        sortDirection: String = "DESC"
    ) async throws -> DealerPageResponse {
        let query = "page=\(page)&size=\(size)&sortBy=\(sortBy)&sortDirection=\(sortDirection)"
        return try await apiClient.makeRequest(
            endpoint: "/dealers?\(query)",
            method: "GET"
        )
    }
    
    func updateDealer(id: String, name: String?, email: String?, subscriptionType: SubscriptionType?) async throws -> Dealer {
        let request = DealerUpdateRequest(name: name, email: email, subscriptionType: subscriptionType)
        return try await apiClient.makeRequest(
            endpoint: "/dealers/\(id)",
            method: "PATCH",
            body: request
        )
    }
    
    func deleteDealer(id: String) async throws {
        let _: EmptyResponse = try await apiClient.makeRequest(
            endpoint: "/dealers/\(id)",
            method: "DELETE"
        )
    }
}
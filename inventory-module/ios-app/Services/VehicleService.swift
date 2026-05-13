import Foundation

class VehicleService {
    static let shared = VehicleService()
    private let apiClient = ApiClient.shared
    
    private init() {}
    
    func createVehicle(dealerId: String, model: String, price: Double) async throws -> Vehicle {
        let request = VehicleCreateRequest(dealerId: dealerId, model: model, price: price)
        return try await apiClient.makeRequest(
            endpoint: "/vehicles",
            method: "POST",
            body: request
        )
    }
    
    func getVehicle(id: String) async throws -> Vehicle {
        return try await apiClient.makeRequest(
            endpoint: "/vehicles/\(id)",
            method: "GET"
        )
    }
    
    func searchVehicles(
        model: String? = nil,
        status: VehicleStatus? = nil,
        priceMin: Double? = nil,
        priceMax: Double? = nil,
        subscription: SubscriptionType? = nil,
        page: Int = 0,
        size: Int = 20,
        sortBy: String = "createdAt",
        sortDirection: String = "DESC"
    ) async throws -> VehiclePageResponse {
        var queryParams: [String] = []
        if let model = model { queryParams.append("model=\(model)") }
        if let status = status { queryParams.append("status=\(status.rawValue)") }
        if let priceMin = priceMin { queryParams.append("priceMin=\(priceMin)") }
        if let priceMax = priceMax { queryParams.append("priceMax=\(priceMax)") }
        if let subscription = subscription { queryParams.append("subscription=\(subscription.rawValue)") }
        queryParams.append("page=\(page)")
        queryParams.append("size=\(size)")
        queryParams.append("sortBy=\(sortBy)")
        queryParams.append("sortDirection=\(sortDirection)")
        
        let query = queryParams.joined(separator: "&")
        return try await apiClient.makeRequest(
            endpoint: "/vehicles?\(query)",
            method: "GET"
        )
    }
    
    func updateVehicle(id: String, model: String?, price: Double?, status: VehicleStatus?) async throws -> Vehicle {
        let request = VehicleUpdateRequest(model: model, price: price, status: status)
        return try await apiClient.makeRequest(
            endpoint: "/vehicles/\(id)",
            method: "PATCH",
            body: request
        )
    }
    
    func deleteVehicle(id: String) async throws {
        let _: EmptyResponse = try await apiClient.makeRequest(
            endpoint: "/vehicles/\(id)",
            method: "DELETE"
        )
    }
}
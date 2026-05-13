import Foundation

enum VehicleStatus: String, Codable {
    case AVAILABLE
    case SOLD
}

enum SubscriptionType: String, Codable {
    case BASIC
    case PREMIUM
}

struct Vehicle: Codable, Identifiable {
    var id: String?
    var dealerId: String?
    var dealerName: String?
    var dealerSubscriptionType: SubscriptionType?
    var model: String?
    var price: Double?
    var status: VehicleStatus?
    var createdAt: Date?
    var updatedAt: Date?
}

struct VehicleCreateRequest: Codable {
    let dealerId: String
    let model: String
    let price: Double
}

struct VehicleUpdateRequest: Codable {
    let model: String?
    let price: Double?
    let status: VehicleStatus?
}

struct VehiclePageResponse: Codable {
    var content: [Vehicle] = []
    var pageNumber: Int = 0
    var pageSize: Int = 20
    var totalElements: Int = 0
    var totalPages: Int = 0
    var first: Bool = false
    var last: Bool = false
    var empty: Bool = false
}

struct DealerPageResponse: Codable {
    var content: [Dealer] = []
    var pageNumber: Int = 0
    var pageSize: Int = 20
    var totalElements: Int = 0
    var totalPages: Int = 0
    var first: Bool = false
    var last: Bool = false
    var empty: Bool = false
}

struct VehicleSearchRequest: Codable {
    var model: String?
    var status: VehicleStatus?
    var priceMin: Double?
    var priceMax: Double?
    var subscription: SubscriptionType?
    var page: Int
    var size: Int
    var sortBy: String
    var sortDirection: String
}
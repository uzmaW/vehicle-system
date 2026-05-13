import Foundation

struct Dealer: Codable, Identifiable {
    let id: String
    var tenantId: String
    var name: String
    var email: String
    var subscriptionType: SubscriptionType
    var createdAt: Date
    var updatedAt: Date
    
    enum CodingKeys: String, CodingKey {
        case id
        case tenantId = "tenantId"
        case name
        case email
        case subscriptionType = "subscriptionType"
        case createdAt = "createdAt"
        case updatedAt = "updatedAt"
    }
}

struct DealerCreateRequest: Codable {
    let name: String
    let email: String
    let subscriptionType: SubscriptionType
}

struct DealerUpdateRequest: Codable {
    let name: String?
    let email: String?
    let subscriptionType: SubscriptionType?
}
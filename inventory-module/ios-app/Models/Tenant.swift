import Foundation

struct Tenant: Codable, Identifiable {
    var id: String
    var uuid: String
    var name: String
    var domain: String
    var active: Bool
    var createdAt: Date
    var updatedAt: Date
}

struct TenantRegisterRequest: Codable {
    let name: String
    let domain: String
    let adminEmail: String
    let adminPassword: String
    let adminName: String
}

struct TenantRegisterResponse: Codable {
    let tenantId: String
    let adminUserId: String
    let message: String
}
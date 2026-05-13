import Foundation

enum UserRole: String, Codable, CaseIterable {
    case STANDARD = "STANDARD"
    case TENANT_ADMIN = "TENANT_ADMIN"
    case GLOBAL_ADMIN = "GLOBAL_ADMIN"
}

struct User: Codable, Identifiable {
    let id: String
    var uuid: String
    var name: String
    var email: String
    var tenantId: String
    var role: UserRole
    var active: Bool
    var createdAt: Date
    var updatedAt: Date
    
    enum CodingKeys: String, CodingKey {
        case id
        case uuid
        case name
        case email
        case tenantId = "tenantId"
        case role
        case active
        case createdAt = "createdAt"
        case updatedAt = "updatedAt"
    }
}

struct LoginRequest: Codable {
    let email: String
    let password: String
}

struct LoginResponse: Codable {
    let token: String?
    let tokenType: String?
    let expiresIn: Int?
    let userId: String?
    let email: String?
    let tenantId: String?
    let role: UserRole?
    
    enum CodingKeys: String, CodingKey {
        case token
        case tokenType = "tokenType"
        case expiresIn = "expiresIn"
        case userId = "userId"
        case email
        case tenantId = "tenantId"
        case role
    }
}
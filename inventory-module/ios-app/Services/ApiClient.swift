import Foundation

class ApiClient {
    static let shared = ApiClient()
    
    private let baseURL = "http://localhost:8080"
    private let session: URLSession
    private let tokenKey = "authToken"
    private let tenantKey = "tenantId"
    
    private init() {
        let config = URLSessionConfiguration.default
        config.timeoutIntervalForRequest = 30
        self.session = URLSession(configuration: config)
    }
    
    func setAuthToken(_ token: String?, tenantId: String?) {
        if let t = token {
            UserDefaults.standard.set(t, forKey: tokenKey)
            NSLog("SAVED TOKEN: %@", t.prefix(30) as NSString)
        }
        if let id = tenantId {
            UserDefaults.standard.set(id, forKey: tenantKey)
            NSLog("SAVED TENANT: %@", id)
        }
    }
    
    func clearAuth() {
        UserDefaults.standard.removeObject(forKey: tokenKey)
        UserDefaults.standard.removeObject(forKey: tenantKey)
    }
    
    func makeRequest<T: Decodable>(
        endpoint: String,
        method: String = "GET",
        body: Encodable? = nil,
        includeTenant: Bool = true
    ) async throws -> T {
        guard let url = URL(string: "\(baseURL)\(endpoint)") else {
            throw ApiError.invalidURL
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = method
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("application/json", forHTTPHeaderField: "Accept")
        
        let token = UserDefaults.standard.string(forKey: tokenKey)
        if let token = token {
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }
        
        if includeTenant {
            let tenant = UserDefaults.standard.string(forKey: tenantKey)
            if let tenant = tenant {
                request.setValue(tenant, forHTTPHeaderField: "X-Tenant-Id")
            }
        }
        
        if let body = body {
            let encoder = JSONEncoder()
            request.httpBody = try? encoder.encode(AnyEncodable(body))
        }
        
        let (data, response) = try await session.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse else {
            throw ApiError.invalidResponse
        }
        
        if httpResponse.statusCode == 401 || httpResponse.statusCode == 403 {
            clearAuth()
        }
        
        guard (200...299).contains(httpResponse.statusCode) else {
            let errorMsg = String(data: data, encoding: .utf8) ?? "Unknown"
            throw ApiError.serverError("HTTP \(httpResponse.statusCode): \(errorMsg)")
        }
        
        if T.self == EmptyResponse.self {
            return EmptyResponse() as! T
        }
        
        let decoder = JSONDecoder()
        decoder.dateDecodingStrategy = .iso8601
        
        return try decoder.decode(T.self, from: data)
    }
}

struct EmptyResponse: Codable {}

struct ErrorResponse: Codable {
    let message: String
    let timestamp: String?
}

enum ApiError: Error, LocalizedError {
    case invalidURL
    case invalidResponse
    case httpError(Int)
    case serverError(String)
    
    var errorDescription: String? {
        switch self {
        case .invalidURL:
            return "Invalid URL"
        case .invalidResponse:
            return "Invalid response"
        case .httpError(let code):
            return "HTTP error: \(code)"
        case .serverError(let message):
            return message
        }
    }
}

struct AnyEncodable: Encodable {
    private let encode: (Encoder) throws -> Void
    
    init(_ value: Encodable) {
        self.encode = value.encode
    }
    
    func encode(to encoder: Encoder) throws {
        try encode(encoder)
    }
}
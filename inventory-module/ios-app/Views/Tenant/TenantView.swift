import Foundation
import SwiftUI

@MainActor
class TenantViewModel: ObservableObject {
    @Published var tenant: Tenant?
    @Published var isLoading = false
    @Published var errorMessage: String?
    
    private let tenantService = TenantService.shared
    
    func loadTenant() async {
        isLoading = true
        errorMessage = nil
        
        do {
            tenant = try await tenantService.getTenant()
            isLoading = false
        } catch {
            isLoading = false
            errorMessage = error.localizedDescription
        }
    }
}

struct TenantView: View {
    @StateObject private var viewModel = TenantViewModel()
    
    var body: some View {
        NavigationStack {
            Group {
                if viewModel.isLoading {
                    ProgressView()
                } else if let error = viewModel.errorMessage {
                    Text(error)
                        .foregroundColor(.red)
                } else if let tenant = viewModel.tenant {
                    ScrollView {
                        VStack(alignment: .leading, spacing: 16) {
                            VStack(alignment: .leading, spacing: 8) {
                                Text("Name")
                                    .font(.caption)
                                    .foregroundColor(.gray)
                                Text(tenant.name)
                                    .font(.title2)
                            }
                            
                            VStack(alignment: .leading, spacing: 8) {
                                Text("Domain")
                                    .font(.caption)
                                    .foregroundColor(.gray)
                                Text(tenant.domain)
                            }
                            
                            VStack(alignment: .leading, spacing: 8) {
                                Text("Status")
                                    .font(.caption)
                                    .foregroundColor(.gray)
                                Text(tenant.active ? "Active" : "Inactive")
                                    .foregroundColor(tenant.active ? .green : .red)
                            }
                        }
                        .padding()
                    }
                    .navigationTitle(tenant.name)
                } else {
                    Text("No tenant information")
                        .foregroundColor(.gray)
                }
            }
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button(action: {
                        Task { await viewModel.loadTenant() }
                    }) {
                        Image(systemName: "arrow.clockwise")
                    }
                }
            }
            .task {
                await viewModel.loadTenant()
            }
        }
    }
}

struct TenantRegisterView: View {
    @Environment(\.dismiss) var dismiss
    @StateObject private var viewModel = TenantViewModel()
    
    @State private var name = ""
    @State private var domain = ""
    @State private var adminEmail = ""
    @State private var adminPassword = ""
    @State private var adminName = ""
    @State private var isRegistering = false
    
    var body: some View {
        NavigationStack {
            Form {
                Section(header: Text("Tenant Info")) {
                    TextField("Organization Name", text: $name)
                    TextField("Domain", text: $domain)
                }
                
                Section(header: Text("Admin Account")) {
                    TextField("Admin Name", text: $adminName)
                    TextField("Admin Email", text: $adminEmail)
                        .textContentType(.emailAddress)
                        .autocapitalization(.none)
                    SecureField("Password", text: $adminPassword)
                }
            }
            .navigationTitle("Register Tenant")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Register") {
                        Task {
                            isRegistering = true
                            _ = try? await TenantService.shared.register(
                                name: name,
                                domain: domain,
                                adminEmail: adminEmail,
                                adminPassword: adminPassword,
                                adminName: adminName
                            )
                            isRegistering = false
                            dismiss()
                        }
                    }
                    .disabled(name.isEmpty || domain.isEmpty || adminEmail.isEmpty || adminPassword.isEmpty || adminName.isEmpty || isRegistering)
                }
            }
        }
    }
}
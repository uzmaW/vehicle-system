import SwiftUI

struct MainTabView: View {
    @EnvironmentObject var authViewModel: AuthViewModel
    
    var body: some View {
        TabView {
            VehicleListView()
                .tabItem {
                    Label("Vehicles", systemImage: "car.fill")
                }
            
            DealerListView()
                .tabItem {
                    Label("Dealers", systemImage: "building.2.fill")
                }
            
            ProfileView()
                .tabItem {
                    Label("Profile", systemImage: "person.circle.fill")
                }
        }
    }
}

struct ProfileView: View {
    @EnvironmentObject var authViewModel: AuthViewModel
    
    var body: some View {
        NavigationStack {
            VStack(spacing: 24) {
                Image(systemName: "person.circle.fill")
                    .resizable()
                    .frame(width: 100, height: 100)
                    .foregroundColor(.blue)
                
                if let user = authViewModel.currentUser {
                    VStack(spacing: 12) {
                        Text(user.email ?? "N/A")
                            .font(.title2)
                            .fontWeight(.semibold)
                        
                        Divider()
                        
                        HStack {
                            Text("Role:")
                                .foregroundColor(.gray)
                            Text(user.role?.rawValue ?? "N/A")
                                .fontWeight(.medium)
                        }
                        
                        if let tenantId = user.tenantId {
                            HStack {
                                Text("Tenant ID:")
                                    .foregroundColor(.gray)
                                Text(tenantId)
                                    .font(.caption)
                                    .foregroundColor(.gray)
                            }
                        }
                    }
                    .padding()
                } else {
                    Text("No user logged in")
                        .foregroundColor(.gray)
                }
                
                Spacer()
                
                Button(action: {
                    Task {
                        await authViewModel.logout()
                    }
                }) {
                    HStack {
                        Image(systemName: "rectangle.portrait.and.arrow.right")
                        Text("Logout")
                    }
                    .foregroundColor(.white)
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(Color.red)
                    .cornerRadius(10)
                }
                .padding(.horizontal, 32)
            }
            .navigationTitle("Profile")
        }
    }
}
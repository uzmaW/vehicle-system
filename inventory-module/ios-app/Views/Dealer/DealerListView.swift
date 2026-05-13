import SwiftUI

struct DealerListView: View {
    @StateObject private var viewModel = DealerViewModel()
    @State private var showAddDealer = false
    @State private var isInitializing = true

    var body: some View {
        NavigationStack {
            Group {
                if isInitializing {
                    SkeletonLoadingView()
                } else if viewModel.isLoading && viewModel.dealers.isEmpty {
                    ProgressView()
                } else if let error = viewModel.errorMessage, viewModel.dealers.isEmpty {
                    VStack(spacing: 16) {
                        Image(systemName: "exclamationmark.triangle")
                            .font(.largeTitle)
                            .foregroundColor(.orange)
                        Text(error)
                            .foregroundColor(.red)
                            .multilineTextAlignment(.center)
                        Button("Retry") {
                            Task { await viewModel.loadDealers() }
                        }
                        .buttonStyle(.bordered)
                    }
                    .padding()
                } else if viewModel.dealers.isEmpty {
                    VStack(spacing: 16) {
                        Image(systemName: "building.2.fill")
                            .font(.largeTitle)
                            .foregroundColor(.gray)
                        Text("No dealers found")
                            .foregroundColor(.gray)
                        Button(action: { showAddDealer = true }) {
                            Label("Add Dealer", systemImage: "plus")
                        }
                        .buttonStyle(.bordered)
                    }
                } else {
                    List {
                        ForEach(viewModel.dealers) { dealer in
                            NavigationLink(destination: DealerDetailView(dealer: dealer)) {
                                DealerRowView(dealer: dealer)
                            }
                        }
                    }
                    .listStyle(PlainListStyle())
                }
            }
            .navigationTitle("Dealers")
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button(action: { showAddDealer = true }) {
                        Image(systemName: "plus.circle.fill")
                    }
                }
            }
            .onAppear {
                if viewModel.dealers.isEmpty {
                    Task { await viewModel.loadDealers() }
                }
                isInitializing = false
            }
            .sheet(isPresented: $showAddDealer) {
                AddDealerView(viewModel: viewModel)
            }
        }
    }
}

struct DealerRowView: View {
    let dealer: Dealer
    
    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(dealer.name)
                .font(.headline)
            
            Text(dealer.email)
                .font(.subheadline)
                .foregroundColor(.gray)
            
            Text(dealer.subscriptionType.rawValue)
                .font(.caption)
                .padding(.horizontal, 8)
                .padding(.vertical, 4)
                .background(dealer.subscriptionType == .PREMIUM ? Color.purple.opacity(0.2) : Color.gray.opacity(0.2))
                .cornerRadius(4)
        }
        .padding(.vertical, 4)
    }
}

struct DealerDetailView: View {
    let dealer: Dealer
    
    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 16) {
                VStack(alignment: .leading, spacing: 8) {
                    Text("Name")
                        .font(.caption)
                        .foregroundColor(.gray)
                    Text(dealer.name)
                        .font(.title2)
                }
                
                VStack(alignment: .leading, spacing: 8) {
                    Text("Email")
                        .font(.caption)
                        .foregroundColor(.gray)
                    Text(dealer.email)
                }
                
                VStack(alignment: .leading, spacing: 8) {
                    Text("Subscription")
                        .font(.caption)
                        .foregroundColor(.gray)
                    Text(dealer.subscriptionType.rawValue)
                        .foregroundColor(dealer.subscriptionType == .PREMIUM ? .purple : .gray)
                }
            }
            .padding()
        }
        .navigationTitle(dealer.name)
        .navigationBarTitleDisplayMode(.inline)
    }
}

struct AddDealerView: View {
    @ObservedObject var viewModel: DealerViewModel
    @Environment(\.dismiss) var dismiss
    
    @State private var name = ""
    @State private var email = ""
    @State private var subscriptionType: SubscriptionType = .BASIC
    
    var body: some View {
        NavigationStack {
            Form {
                Section {
                    TextField("Dealer Name", text: $name)
                    TextField("Email", text: $email)
                        .textContentType(.emailAddress)
                        .autocapitalization(.none)
                    Picker("Subscription", selection: $subscriptionType) {
                        Text("Basic").tag(SubscriptionType.BASIC)
                        Text("Premium").tag(SubscriptionType.PREMIUM)
                    }
                }
            }
            .navigationTitle("Add Dealer")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Save") {
                        Task {
                            await viewModel.createDealer(
                                name: name,
                                email: email,
                                subscriptionType: subscriptionType
                            )
                            dismiss()
                        }
                    }
                    .disabled(name.isEmpty || email.isEmpty)
                }
            }
        }
    }
}

#Preview {
    DealerListView()
}
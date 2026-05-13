import SwiftUI

struct VehicleListView: View {
    @StateObject private var viewModel = VehicleViewModel()
    @State private var showAddVehicle = false
    @State private var isInitializing = true
    @State private var selectedTab = 0
    
    var body: some View {
        NavigationStack {
            Group {
                if isInitializing {
                    SkeletonLoadingView()
                } else if viewModel.isLoading && viewModel.vehicles.isEmpty {
                    ProgressView()
                } else if let error = viewModel.errorMessage, viewModel.vehicles.isEmpty {
                    VStack(spacing: 16) {
                        Image(systemName: "exclamationmark.triangle")
                            .font(.largeTitle)
                            .foregroundColor(.orange)
                        Text(error)
                            .foregroundColor(.red)
                            .multilineTextAlignment(.center)
                        Button("Retry") {
                            Task { await viewModel.loadVehicles() }
                        }
                        .buttonStyle(.bordered)
                    }
                    .padding()
                } else if viewModel.vehicles.isEmpty {
                    VStack(spacing: 16) {
                        Image(systemName: "car.fill")
                            .font(.largeTitle)
                            .foregroundColor(.gray)
                        Text("No vehicles found")
                            .foregroundColor(.gray)
                        Button(action: { showAddVehicle = true }) {
                            Label("Add Vehicle", systemImage: "plus")
                        }
                        .buttonStyle(.bordered)
                    }
                } else {
                    List {
                        ForEach(viewModel.vehicles) { vehicle in
                            NavigationLink(destination: VehicleDetailView(vehicle: vehicle)) {
                                VehicleRowView(vehicle: vehicle)
                            }
                        }
                    }
                    .listStyle(PlainListStyle())
                }
            }
            .navigationTitle("Vehicles")
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button(action: { showAddVehicle = true }) {
                        Image(systemName: "plus.circle.fill")
                    }
                }
            }
            .onAppear {
                if viewModel.vehicles.isEmpty {
                    Task { await viewModel.loadVehicles() }
                }
                isInitializing = false
            }
            .sheet(isPresented: $showAddVehicle) {
                AddVehicleView(viewModel: viewModel)
            }
        }
    }
}

struct SkeletonLoadingView: View {
    @State private var isAnimating = false

    var body: some View {
        VStack(spacing: 20) {
            ForEach(0..<5, id: \.self) { _ in
                SkeletonRowView(isAnimating: isAnimating)
            }
        }
        .padding()
        .onAppear {
            withAnimation(.easeInOut(duration: 1.0).repeatForever(autoreverses: true)) {
                isAnimating = true
            }
        }
    }
}

struct SkeletonRowView: View {
    let isAnimating: Bool
    @State private var opacity: Double = 0.3

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            RoundedRectangle(cornerRadius: 4)
                .fill(Color.gray.opacity(opacity))
                .frame(width: 150, height: 16)

            HStack {
                RoundedRectangle(cornerRadius: 4)
                    .fill(Color.gray.opacity(opacity))
                    .frame(width: 100, height: 12)
                Spacer()
                RoundedRectangle(cornerRadius: 4)
                    .fill(Color.gray.opacity(opacity))
                    .frame(width: 60, height: 12)
            }

            HStack {
                RoundedRectangle(cornerRadius: 4)
                    .fill(Color.gray.opacity(opacity))
                    .frame(width: 80, height: 16)
                Spacer()
                RoundedRectangle(cornerRadius: 4)
                    .fill(Color.gray.opacity(opacity))
                    .frame(width: 50, height: 12)
            }
        }
        .padding(.vertical, 8)
        .onAppear {
            opacity = 0.6
        }
    }
}

struct VehicleRowView: View {
    let vehicle: Vehicle
    
    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(vehicle.model ?? "N/A")
                .font(.headline)
            
            HStack {
                Text(vehicle.dealerName ?? "N/A")
                    .font(.subheadline)
                    .foregroundColor(.gray)
                
                Spacer()
                
                Text("$\(vehicle.price ?? 0, specifier: "%.2f")")
                    .font(.subheadline)
                    .foregroundColor(.blue)
            }
            
            HStack {
                Text(vehicle.status?.rawValue ?? "N/A")
                    .font(.caption)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 4)
                    .background(vehicle.status == .AVAILABLE ? Color.green.opacity(0.2) : Color.red.opacity(0.2))
                    .cornerRadius(4)
                
                Spacer()
                
                Text(vehicle.dealerSubscriptionType?.rawValue ?? "N/A")
                    .font(.caption)
                    .foregroundColor(.gray)
            }
        }
        .padding(.vertical, 4)
    }
}

struct VehicleDetailView: View {
    let vehicle: Vehicle
    
    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 16) {
                VStack(alignment: .leading, spacing: 8) {
                    Text("Model")
                        .font(.caption)
                        .foregroundColor(.gray)
                    Text(vehicle.model ?? "N/A")
                        .font(.title2)
                }
                
                VStack(alignment: .leading, spacing: 8) {
                    Text("Price")
                        .font(.caption)
                        .foregroundColor(.gray)
                    Text("$\(vehicle.price ?? 0, specifier: "%.2f")")
                        .font(.title2)
                        .foregroundColor(.blue)
                }
                
                VStack(alignment: .leading, spacing: 8) {
                    Text("Status")
                        .font(.caption)
                        .foregroundColor(.gray)
                    Text(vehicle.status?.rawValue ?? "N/A")
                        .foregroundColor(vehicle.status == .AVAILABLE ? .green : .red)
                }
                
                VStack(alignment: .leading, spacing: 8) {
                    Text("Dealer")
                        .font(.caption)
                        .foregroundColor(.gray)
                    Text(vehicle.dealerName ?? "N/A")
                    
                    Text(vehicle.dealerSubscriptionType?.rawValue ?? "N/A")
                        .font(.caption)
                        .foregroundColor(.gray)
                }
            }
            .padding()
        }
        .navigationTitle(vehicle.model ?? "Vehicle")
        .navigationBarTitleDisplayMode(.inline)
    }
}

struct AddVehicleView: View {
    @ObservedObject var viewModel: VehicleViewModel
    @Environment(\.dismiss) var dismiss
    
    @State private var model = ""
    @State private var price = ""
    @State private var dealerId = ""
    
    var body: some View {
        NavigationStack {
            Form {
                Section {
                    TextField("Vehicle Model", text: $model)
                    TextField("Price", text: $price)
                        .keyboardType(.decimalPad)
                    TextField("Dealer ID", text: $dealerId)
                }
            }
            .navigationTitle("Add Vehicle")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Save") {
                        Task {
                            if let priceValue = Double(price) {
                                await viewModel.createVehicle(
                                    dealerId: dealerId,
                                    model: model,
                                    price: priceValue
                                )
                                dismiss()
                            }
                        }
                    }
                    .disabled(model.isEmpty || price.isEmpty || dealerId.isEmpty)
                }
            }
        }
    }
}

#Preview {
    VehicleListView()
}
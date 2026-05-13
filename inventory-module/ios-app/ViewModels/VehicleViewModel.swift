import Foundation
import SwiftUI

@MainActor
class VehicleViewModel: ObservableObject {
    @Published var vehicles: [Vehicle] = []
    @Published var isLoading = false
    @Published var errorMessage: String?
    @Published var currentPage = 0
    @Published var totalPages = 0

    private let vehicleService = VehicleService.shared

    func loadVehicles(page: Int = 0) async {
        isLoading = true
        errorMessage = nil

        var token: String?
        var tenant: String?
        var attempts = 0

        while attempts < 10 {
            token = UserDefaults.standard.string(forKey: "authToken")
            tenant = UserDefaults.standard.string(forKey: "tenantId")

            if token != nil && tenant != nil {
                break
            }
            attempts += 1
            try? await Task.sleep(nanoseconds: 50_000_000)
        }

        guard let validToken = token, let validTenant = tenant else {
            isLoading = false
            errorMessage = "Authentication not persisted. Please login again."
            return
        }

        do {
            let response = try await vehicleService.searchVehicles(page: page)
            let vehicleList = response.content
            vehicles = vehicleList
            currentPage = response.pageNumber
            totalPages = response.totalPages
            isLoading = false
        } catch {
            isLoading = false
            errorMessage = "Failed to load vehicles: \(error.localizedDescription)"
        }
    }

    func createVehicle(dealerId: String, model: String, price: Double) async {
        isLoading = true

        do {
            _ = try await vehicleService.createVehicle(dealerId: dealerId, model: model, price: price)
            await loadVehicles()
        } catch {
            isLoading = false
            errorMessage = error.localizedDescription
        }
    }

    func deleteVehicle(id: String) async {
        do {
            try await vehicleService.deleteVehicle(id: id)
            await loadVehicles()
        } catch {
            errorMessage = error.localizedDescription
        }
    }
}
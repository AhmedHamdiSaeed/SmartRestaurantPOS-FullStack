package com.smartpos.restaurant.dto;

import com.smartpos.restaurant.model.TableStatus;
import jakarta.validation.constraints.*;
import java.time.Instant;

public final class RestaurantDtos {
    private RestaurantDtos() { }
    public record CreateRestaurant(@NotBlank String name, @NotBlank @Pattern(regexp = "[A-Za-z0-9_-]+") String code, String timezone) { }
    public record RestaurantResponse(String id, String name, String code, String timezone, Instant createdAt) { }
    public record CreateBranch(@NotBlank String restaurantId, @NotBlank String name, @NotBlank String code, String address, String timezone) { }
    public record BranchResponse(String id, String restaurantId, String name, String code, String address, String timezone) { }
    public record CreateTable(@NotBlank String branchId, @NotBlank String tableNumber, String floorName, String sectionName, @Min(1) Integer capacity) { }
    public record TableResponse(String id, String branchId, String tableNumber, String floorName, String sectionName, Integer capacity, TableStatus status) { }
    public record UpdateTableStatus(@NotNull TableStatus status) { }
}

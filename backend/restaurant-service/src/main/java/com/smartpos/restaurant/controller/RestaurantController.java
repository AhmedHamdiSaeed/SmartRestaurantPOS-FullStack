package com.smartpos.restaurant.controller;

import com.smartpos.restaurant.dto.RestaurantDtos.*;
import com.smartpos.restaurant.service.RestaurantManagementService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/restaurants")
@RequiredArgsConstructor
public class RestaurantController {
    private final RestaurantManagementService service;
    @PostMapping @ResponseStatus(HttpStatus.CREATED) public RestaurantResponse createRestaurant(@Valid @RequestBody CreateRestaurant request) { return service.createRestaurant(request); }
    @GetMapping public List<RestaurantResponse> listRestaurants() { return service.listRestaurants(); }
    @PostMapping("/branches") @ResponseStatus(HttpStatus.CREATED) public BranchResponse createBranch(@Valid @RequestBody CreateBranch request) { return service.createBranch(request); }
    @GetMapping("/{restaurantId}/branches") public List<BranchResponse> listBranches(@PathVariable String restaurantId) { return service.listBranches(restaurantId); }
    @PostMapping("/tables") @ResponseStatus(HttpStatus.CREATED) public TableResponse createTable(@Valid @RequestBody CreateTable request) { return service.createTable(request); }
    @GetMapping("/branches/{branchId}/tables") public List<TableResponse> listTables(@PathVariable String branchId) { return service.listTables(branchId); }
    @PatchMapping("/tables/{id}/status") public TableResponse updateStatus(@PathVariable String id, @Valid @RequestBody UpdateTableStatus request) { return service.updateTableStatus(id, request); }
}

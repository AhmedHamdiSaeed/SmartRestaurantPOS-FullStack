package com.smartpos.restaurant.service;

import com.smartpos.restaurant.dto.RestaurantDtos.*;
import com.smartpos.restaurant.model.*;
import com.smartpos.restaurant.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RestaurantManagementService {
    private final RestaurantRepository restaurants;
    private final BranchRepository branches;
    private final RestaurantTableRepository tables;

    public RestaurantResponse createRestaurant(CreateRestaurant request) {
        if (restaurants.existsByCode(request.code())) throw new ResponseStatusException(HttpStatus.CONFLICT, "Restaurant code already exists");
        Restaurant restaurant = restaurants.save(Restaurant.builder().name(request.name()).code(request.code()).timezone(request.timezone()).build());
        return restaurantResponse(restaurant);
    }
    public List<RestaurantResponse> listRestaurants() { return restaurants.findAll().stream().map(this::restaurantResponse).toList(); }
    public BranchResponse createBranch(CreateBranch request) {
        Restaurant restaurant = restaurants.findById(request.restaurantId()).orElseThrow(() -> notFound("Restaurant"));
        Branch branch = branches.save(Branch.builder().restaurant(restaurant).name(request.name()).code(request.code()).address(request.address()).timezone(request.timezone()).build());
        return branchResponse(branch);
    }
    public List<BranchResponse> listBranches(String restaurantId) { return branches.findByRestaurantIdOrderByName(restaurantId).stream().map(this::branchResponse).toList(); }
    public TableResponse createTable(CreateTable request) {
        Branch branch = branches.findById(request.branchId()).orElseThrow(() -> notFound("Branch"));
        RestaurantTable table = tables.save(RestaurantTable.builder().branch(branch).tableNumber(request.tableNumber()).floorName(request.floorName()).sectionName(request.sectionName()).capacity(request.capacity()).build());
        return tableResponse(table);
    }
    public List<TableResponse> listTables(String branchId) { return tables.findByBranchIdOrderByTableNumber(branchId).stream().map(this::tableResponse).toList(); }
    public TableResponse updateTableStatus(String id, UpdateTableStatus request) {
        RestaurantTable table = tables.findById(id).orElseThrow(() -> notFound("Table"));
        table.setStatus(request.status());
        return tableResponse(tables.save(table));
    }
    private ResponseStatusException notFound(String resource) { return new ResponseStatusException(HttpStatus.NOT_FOUND, resource + " not found"); }
    private RestaurantResponse restaurantResponse(Restaurant value) { return new RestaurantResponse(value.getId(), value.getName(), value.getCode(), value.getTimezone(), value.getCreatedAt()); }
    private BranchResponse branchResponse(Branch value) { return new BranchResponse(value.getId(), value.getRestaurant().getId(), value.getName(), value.getCode(), value.getAddress(), value.getTimezone()); }
    private TableResponse tableResponse(RestaurantTable value) { return new TableResponse(value.getId(), value.getBranch().getId(), value.getTableNumber(), value.getFloorName(), value.getSectionName(), value.getCapacity(), value.getStatus()); }
}

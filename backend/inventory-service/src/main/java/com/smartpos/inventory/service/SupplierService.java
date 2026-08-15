package com.smartpos.inventory.service;

import com.smartpos.inventory.dto.SupplierRequest;
import com.smartpos.inventory.dto.SupplierResponse;
import com.smartpos.inventory.model.Supplier;
import com.smartpos.inventory.repository.SupplierRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SupplierService {

    private final SupplierRepository supplierRepository;

    @Transactional
    public SupplierResponse createSupplier(String tenantId, SupplierRequest request) {
        Supplier supplier = Supplier.builder()
                .tenantId(tenantId)
                .name(request.getName())
                .contactName(request.getContactName())
                .contactEmail(request.getContactEmail())
                .contactPhone(request.getContactPhone())
                .address(request.getAddress())
                .build();
        supplier = supplierRepository.save(supplier);
        return mapToResponse(supplier);
    }

    @Transactional(readOnly = true)
    public List<SupplierResponse> getSuppliers(String tenantId) {
        return supplierRepository.findByTenantIdAndActiveTrue(tenantId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private SupplierResponse mapToResponse(Supplier s) {
        return SupplierResponse.builder()
                .id(s.getId())
                .tenantId(s.getTenantId())
                .name(s.getName())
                .contactName(s.getContactName())
                .contactEmail(s.getContactEmail())
                .contactPhone(s.getContactPhone())
                .address(s.getAddress())
                .rating(s.getRating())
                .active(s.isActive())
                .createdAt(s.getCreatedAt())
                .build();
    }
}

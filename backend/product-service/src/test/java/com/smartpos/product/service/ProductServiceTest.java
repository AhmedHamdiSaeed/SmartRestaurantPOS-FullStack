package com.smartpos.product.service;

import com.smartpos.product.dto.ProductRequest;
import com.smartpos.product.dto.ProductResponse;
import com.smartpos.product.dto.ProductSearchResponse;
import com.smartpos.product.model.Product;
import com.smartpos.product.model.enums.ProductCategory;
import com.smartpos.product.repository.ProductRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProductServiceTest {

    @Mock
    private ProductRepository productRepository;

    @InjectMocks
    private ProductService productService;

    private Product testProduct;

    @BeforeEach
    void setUp() {
        testProduct = Product.builder()
                .id("prod-1")
                .tenantId("tenant-1")
                .name("Classic Cheeseburger")
                .sku("BUR-001")
                .category(ProductCategory.BURGERS)
                .price(29.99)
                .description("Juicy beef patty with cheddar cheese")
                .isAvailable(true)
                .isPopular(true)
                .build();
    }

    @Test
    @DisplayName("getAllProducts — Should return mapped products list")
    void getAllProducts_shouldReturnList() {
        when(productRepository.findAll()).thenReturn(List.of(testProduct));

        List<ProductResponse> products = productService.getAllProducts();

        assertEquals(1, products.size());
        assertEquals("Classic Cheeseburger", products.get(0).getName());
        assertEquals(29.99, products.get(0).getPrice());
    }

    @Test
    @DisplayName("createProduct — Should save and return product response")
    void createProduct_shouldPersistAndReturn() {
        ProductRequest req = ProductRequest.builder()
                .name("Classic Cheeseburger")
                .sku("BUR-001")
                .category(ProductCategory.BURGERS)
                .price(29.99)
                .description("Juicy beef patty with cheddar cheese")
                .build();

        when(productRepository.save(any(Product.class))).thenReturn(testProduct);

        ProductResponse res = productService.createProduct("tenant-1", req);

        assertNotNull(res);
        assertEquals("Classic Cheeseburger", res.getName());
        verify(productRepository).save(any(Product.class));
    }

    @Test
    @DisplayName("searchProducts — Should match query string and score relevance")
    void searchProducts_shouldFilterAndScore() {
        when(productRepository.findAll()).thenReturn(List.of(testProduct));

        List<ProductSearchResponse> results = productService.searchProducts("cheeseburger", "burgers");

        assertEquals(1, results.size());
        assertTrue(results.get(0).getMatchScore() > 0);
        assertTrue(results.get(0).getHighlightedName().contains("<mark>"));
    }

    @Test
    @DisplayName("deleteProduct — Should call repository delete")
    void deleteProduct_shouldDeleteIfExists() {
        when(productRepository.existsById("prod-1")).thenReturn(true);

        productService.deleteProduct("prod-1");

        verify(productRepository).deleteById("prod-1");
    }
}

package com.stockmind.rest;

import com.stockmind.dto.ProductResponse;
import com.stockmind.dto.SupplierRequest;
import com.stockmind.dto.SupplierResponse;
import com.stockmind.entity.ProductEntity;
import com.stockmind.mapper.ProductMapper;
import com.stockmind.model.Supplier;
import com.stockmind.service.SupplierService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/suppliers")
public class SupplierController {

    private final SupplierService supplierService;

    public SupplierController(SupplierService supplierService) {
        this.supplierService = supplierService;
    }

    @GetMapping
    public ResponseEntity<List<SupplierResponse>> getAllSuppliers(@RequestParam(value = "query", required = false) String query) {
        List<SupplierResponse> suppliers = supplierService.getAllSuppliers(query);
        return ResponseEntity.ok(suppliers);
    }

    @GetMapping("/{id}")
    public ResponseEntity<SupplierResponse> getSupplierById(@PathVariable("id") String id) {
        Supplier supplier = supplierService.getSupplierById(id);
        int count = supplierService.getProductsBySupplier(id).size();
        return ResponseEntity.ok(SupplierResponse.fromDomain(supplier, count));
    }

    @PostMapping
    public ResponseEntity<SupplierResponse> createSupplier(@Valid @RequestBody SupplierRequest request) {
        Supplier created = supplierService.createSupplier(request);
        return new ResponseEntity<>(SupplierResponse.fromDomain(created, 0), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<SupplierResponse> updateSupplier(@PathVariable("id") String id, @Valid @RequestBody SupplierRequest request) {
        Supplier updated = supplierService.updateSupplier(id, request);
        int count = supplierService.getProductsBySupplier(id).size();
        return ResponseEntity.ok(SupplierResponse.fromDomain(updated, count));
    }

    @GetMapping("/{id}/products")
    public ResponseEntity<List<ProductResponse>> getSupplierProducts(@PathVariable("id") String id) {
        List<ProductEntity> entities = supplierService.getProductsBySupplier(id);
        List<ProductResponse> responses = entities.stream()
                .map(ProductMapper::toDomain)
                .map(ProductResponse::fromDomain)
                .toList();
        return ResponseEntity.ok(responses);
    }
}

package com.stockmind.service;

import com.stockmind.dto.SupplierRequest;
import com.stockmind.dto.SupplierResponse;
import com.stockmind.entity.ProductEntity;
import com.stockmind.entity.SupplierEntity;
import com.stockmind.exceptions.DuplicateProductException;
import com.stockmind.exceptions.SupplierNotFoundException;
import com.stockmind.mapper.SupplierMapper;
import com.stockmind.model.Supplier;
import com.stockmind.repository.ProductRepository;
import com.stockmind.repository.SupplierRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class SupplierService {

    private final SupplierRepository supplierRepository;
    private final ProductRepository productRepository;

    public SupplierService(SupplierRepository supplierRepository, ProductRepository productRepository) {
        this.supplierRepository = supplierRepository;
        this.productRepository = productRepository;
    }

    public List<SupplierResponse> getAllSuppliers(String query) {
        List<SupplierEntity> entities;
        if (query == null || query.trim().isEmpty()) {
            entities = supplierRepository.findAll();
        } else {
            entities = supplierRepository.searchSuppliers(query.trim());
        }

        return entities.stream().map(entity -> {
            Supplier domain = SupplierMapper.toDomain(entity);
            int count = productRepository.findBySupplierId(domain.getId()).size();
            return SupplierResponse.fromDomain(domain, count);
        }).toList();
    }

    public Supplier getSupplierById(String id) {
        SupplierEntity entity = supplierRepository.findById(id)
                .orElseThrow(() -> new SupplierNotFoundException(id));
        return SupplierMapper.toDomain(entity);
    }

    @Transactional
    public Supplier createSupplier(SupplierRequest request) {
        if (supplierRepository.existsById(request.getId())) {
            throw new DuplicateProductException("Supplier with ID '" + request.getId() + "' already exists.");
        }

        Supplier domain = request.toDomain();
        domain.validate();

        SupplierEntity entity = SupplierMapper.toEntity(domain);
        SupplierEntity saved = supplierRepository.save(entity);
        return SupplierMapper.toDomain(saved);
    }

    @Transactional
    public Supplier updateSupplier(String id, SupplierRequest request) {
        SupplierEntity existing = supplierRepository.findById(id)
                .orElseThrow(() -> new SupplierNotFoundException(id));

        existing.setName(request.getName().trim());
        existing.setContactPerson(request.getContactPerson());
        existing.setEmail(request.getEmail());
        existing.setPhone(request.getPhone());
        existing.setAddress(request.getAddress());

        Supplier domain = SupplierMapper.toDomain(existing);
        domain.validate();

        SupplierEntity saved = supplierRepository.save(existing);
        return SupplierMapper.toDomain(saved);
    }

    public List<ProductEntity> getProductsBySupplier(String supplierId) {
        if (!supplierRepository.existsById(supplierId)) {
            throw new SupplierNotFoundException(supplierId);
        }
        return productRepository.findBySupplierId(supplierId);
    }
}

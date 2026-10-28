package com.stockmind.mapper;

import com.stockmind.entity.SupplierEntity;
import com.stockmind.model.Supplier;

public class SupplierMapper {

    public static Supplier toDomain(SupplierEntity entity) {
        if (entity == null) return null;
        Supplier domain = new Supplier();
        domain.setId(entity.getId());
        domain.setName(entity.getName());
        domain.setContactPerson(entity.getContactPerson());
        domain.setEmail(entity.getEmail());
        domain.setPhone(entity.getPhone());
        domain.setAddress(entity.getAddress());
        domain.setCreatedAt(entity.getCreatedAt());
        return domain;
    }

    public static SupplierEntity toEntity(Supplier domain) {
        if (domain == null) return null;
        SupplierEntity entity = new SupplierEntity();
        entity.setId(domain.getId());
        entity.setName(domain.getName());
        entity.setContactPerson(domain.getContactPerson());
        entity.setEmail(domain.getEmail());
        entity.setPhone(domain.getPhone());
        entity.setAddress(domain.getAddress());
        entity.setCreatedAt(domain.getCreatedAt());
        return entity;
    }
}

package com.stockmind.dto;

import com.stockmind.model.Supplier;
import java.time.LocalDateTime;

public class SupplierResponse {
    private String id;
    private String name;
    private String contactPerson;
    private String email;
    private String phone;
    private String address;
    private LocalDateTime createdAt;
    private int associatedProductCount;

    public static SupplierResponse fromDomain(Supplier supplier, int productCount) {
        if (supplier == null) return null;
        SupplierResponse resp = new SupplierResponse();
        resp.id = supplier.getId();
        resp.name = supplier.getName();
        resp.contactPerson = supplier.getContactPerson();
        resp.email = supplier.getEmail();
        resp.phone = supplier.getPhone();
        resp.address = supplier.getAddress();
        resp.createdAt = supplier.getCreatedAt();
        resp.associatedProductCount = productCount;
        return resp;
    }

    public String getId() { return id; }
    public String getName() { return name; }
    public String getContactPerson() { return contactPerson; }
    public String getEmail() { return email; }
    public String getPhone() { return phone; }
    public String getAddress() { return address; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public int getAssociatedProductCount() { return associatedProductCount; }
}

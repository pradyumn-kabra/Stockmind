package com.stockmind.dto;

import com.stockmind.model.Supplier;
import jakarta.validation.constraints.NotBlank;

public class SupplierRequest {
    @NotBlank(message = "Supplier ID is required")
    private String id;

    @NotBlank(message = "Supplier name is required")
    private String name;

    private String contactPerson;
    private String email;
    private String phone;
    private String address;

    public Supplier toDomain() {
        return new Supplier(id, name, contactPerson, email, phone, address);
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getContactPerson() { return contactPerson; }
    public void setContactPerson(String contactPerson) { this.contactPerson = contactPerson; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
}

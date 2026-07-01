package com.inventory.supplier;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SupplierRepository extends JpaRepository<Supplier, Long> {
    List<Supplier> findByVendorId(Long vendorId);
    Optional<Supplier> findByIdAndVendorId(Long id, Long vendorId);
}

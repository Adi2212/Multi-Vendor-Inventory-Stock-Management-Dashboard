package com.inventory.sale;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SaleRepository extends JpaRepository<Sale, Long> {
    List<Sale> findByVendorIdOrderBySaleDateDesc(Long vendorId);
    Optional<Sale> findByIdAndVendorId(Long id, Long vendorId);
    List<Sale> findByVendorId(Long vendorId);
}

package com.inventory.user;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    java.util.List<User> findByVendorId(Long vendorId);
    Optional<User> findByIdAndVendorId(Long id, Long vendorId);
}

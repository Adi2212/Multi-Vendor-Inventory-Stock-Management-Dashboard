package com.inventory.report;

import com.inventory.vendor.VendorRepository;
import com.inventory.user.UserRepository;
import com.inventory.vendor.Vendor;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final VendorRepository vendorRepository;
    private final UserRepository userRepository;

    public Map<String, Object> getPlatformStats() {
        long totalVendors = vendorRepository.count();
        long totalUsers = userRepository.count();
        // Additional global stats can go here
        return Map.of(
            "totalVendors", totalVendors,
            "totalUsers", totalUsers
        );
    }

    public List<Vendor> getAllVendors() {
        return vendorRepository.findAll();
    }
}

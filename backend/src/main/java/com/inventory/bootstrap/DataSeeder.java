package com.inventory.bootstrap;

import com.inventory.user.Role;
import com.inventory.user.User;
import com.inventory.user.UserRepository;
import com.inventory.sale.Sale;
import com.inventory.sale.SaleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final SaleRepository saleRepository;

    @Override
    public void run(String... args) throws Exception {
        String adminEmail = "admin@platform.com";
        Optional<User> adminOptional = userRepository.findByEmail(adminEmail);

        if (adminOptional.isEmpty()) {
            log.info("Seeding Super Admin user...");
            User superAdmin = User.builder()
                    .firstName("Super")
                    .lastName("Admin")
                    .email(adminEmail)
                    .passwordHash(passwordEncoder.encode("admin@123"))
                    .role(Role.SUPER_ADMIN)
                    .status("ACTIVE")
                    .build();
            userRepository.save(superAdmin);
            log.info("Super Admin seeded successfully: {}", adminEmail);
        } else {
            log.info("Super Admin already exists. Skipping seed.");
        }

        // Data fix for null saleDates and statuses
        List<Sale> sales = saleRepository.findAll();
        for (Sale sale : sales) {
            boolean updated = false;
            if (sale.getSaleDate() == null) {
                sale.setSaleDate(sale.getCreatedAt() != null ? sale.getCreatedAt() : java.time.LocalDateTime.now());
                updated = true;
            }
            if (sale.getStatus() == null) {
                sale.setStatus("COMPLETED");
                updated = true;
            }
            if (updated) {
                saleRepository.save(sale);
                log.info("Fixed null fields for Sale ID: {}", sale.getId());
            }
        }
    }
}

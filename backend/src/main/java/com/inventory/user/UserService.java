package com.inventory.user;

import com.inventory.security.SecurityUtils;
import com.inventory.user.dto.CreateUserRequest;
import com.inventory.user.dto.UserDTO;
import com.inventory.vendor.Vendor;
import com.inventory.vendor.VendorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final VendorRepository vendorRepository;
    private final PasswordEncoder passwordEncoder;

    public List<UserDTO> getAllUsersForVendor() {
        Long vendorId = SecurityUtils.getCurrentVendorId();
        return userRepository.findByVendorId(vendorId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public UserDTO getUserById(Long id) {
        Long vendorId = SecurityUtils.getCurrentVendorId();
        User user = userRepository.findByIdAndVendorId(id, vendorId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return mapToDTO(user);
    }

    public UserDTO createUser(CreateUserRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email already in use");
        }

        Long vendorId = SecurityUtils.getCurrentVendorId();
        Vendor vendor = vendorRepository.findById(vendorId)
                .orElseThrow(() -> new RuntimeException("Vendor not found"));

        User user = User.builder()
                .vendor(vendor)
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole())
                .status(request.getStatus() != null ? request.getStatus() : "ACTIVE")
                .build();

        return mapToDTO(userRepository.save(user));
    }

    public UserDTO updateUser(Long id, CreateUserRequest request) {
        Long vendorId = SecurityUtils.getCurrentVendorId();
        User user = userRepository.findByIdAndVendorId(id, vendorId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Only update email if it's different and not taken
        if (!user.getEmail().equals(request.getEmail())) {
            if (userRepository.findByEmail(request.getEmail()).isPresent()) {
                throw new RuntimeException("Email already in use");
            }
            user.setEmail(request.getEmail());
        }

        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setRole(request.getRole());
        
        if (request.getStatus() != null) {
            user.setStatus(request.getStatus());
        }

        if (request.getPassword() != null && !request.getPassword().isEmpty()) {
            user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        }

        return mapToDTO(userRepository.save(user));
    }

    public void deleteUser(Long id) {
        Long vendorId = SecurityUtils.getCurrentVendorId();
        User user = userRepository.findByIdAndVendorId(id, vendorId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Prevent deleting the last VENDOR_ADMIN
        if (user.getRole() == Role.VENDOR_ADMIN) {
            long adminCount = userRepository.findByVendorId(vendorId).stream()
                    .filter(u -> u.getRole() == Role.VENDOR_ADMIN)
                    .count();
            if (adminCount <= 1) {
                throw new RuntimeException("Cannot delete the last vendor admin");
            }
        }

        userRepository.delete(user);
    }

    private UserDTO mapToDTO(User user) {
        return UserDTO.builder()
                .id(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .role(user.getRole())
                .status(user.getStatus())
                .createdAt(user.getCreatedAt())
                .build();
    }
}

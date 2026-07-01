package com.inventory.auth;

import com.inventory.auth.dto.JwtResponse;
import com.inventory.auth.dto.LoginRequest;
import com.inventory.auth.dto.RegisterRequest;
import com.inventory.security.CustomUserDetails;
import com.inventory.security.JwtUtils;
import com.inventory.user.Role;
import com.inventory.user.User;
import com.inventory.user.UserRepository;
import com.inventory.vendor.Vendor;
import com.inventory.vendor.VendorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final VendorRepository vendorRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;

    public JwtResponse authenticateUser(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        User user = userRepository.findByEmail(userDetails.getEmail())
                .orElseThrow(() -> new RuntimeException("Error: User not found."));

        return JwtResponse.builder()
                .token(jwt)
                .id(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .vendorId(user.getVendor() != null ? user.getVendor().getId() : null)
                .companyName(user.getVendor() != null ? user.getVendor().getName() : null)
                .build();
    }

    public JwtResponse refreshToken(Authentication authentication) {
        String jwt = jwtUtils.generateJwtToken(authentication);

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        User user = userRepository.findByEmail(userDetails.getEmail())
                .orElseThrow(() -> new RuntimeException("Error: User not found."));

        return JwtResponse.builder()
                .token(jwt)
                .id(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .vendorId(user.getVendor() != null ? user.getVendor().getId() : null)
                .companyName(user.getVendor() != null ? user.getVendor().getName() : null)
                .build();
    }

    @Transactional
    public void registerVendor(RegisterRequest registerRequest) {
        if (userRepository.findByEmail(registerRequest.getEmail()).isPresent()) {
            throw new RuntimeException("Error: Email is already in use!");
        }

        // Create new Vendor
        Vendor vendor = Vendor.builder()
                .name(registerRequest.getCompanyName())
                .email(registerRequest.getEmail())
                .build();
        vendor = vendorRepository.save(vendor);

        // Create new User as VENDOR_ADMIN
        User user = User.builder()
                .vendor(vendor)
                .firstName(registerRequest.getFirstName())
                .lastName(registerRequest.getLastName())
                .email(registerRequest.getEmail())
                .passwordHash(passwordEncoder.encode(registerRequest.getPassword()))
                .role(Role.VENDOR_ADMIN)
                .build();
        userRepository.save(user);
    }
}

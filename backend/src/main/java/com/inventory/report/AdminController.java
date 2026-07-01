package com.inventory.report;

import com.inventory.common.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/stats")
    @PreAuthorize("hasAuthority('ROLE_SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<Object>> getPlatformStats() {
        return ResponseEntity.ok(ApiResponse.success("Platform stats fetched", adminService.getPlatformStats()));
    }

    @GetMapping("/vendors")
    @PreAuthorize("hasAuthority('ROLE_SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<Object>> getAllVendors() {
        return ResponseEntity.ok(ApiResponse.success("All vendors fetched", adminService.getAllVendors()));
    }
}

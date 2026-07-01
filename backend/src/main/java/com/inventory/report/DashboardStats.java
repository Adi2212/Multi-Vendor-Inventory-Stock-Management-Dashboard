package com.inventory.report;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
@AllArgsConstructor
public class DashboardStats {
    private long totalProducts;
    private BigDecimal totalStockValue;
    private long lowStockItems;
    private long activeUsers; // placeholder for active users
}

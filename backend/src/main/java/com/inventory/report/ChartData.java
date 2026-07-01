package com.inventory.report;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ChartData {
    private String name; // e.g., "Mon", "Tue" or date string
    private BigDecimal revenue;
}

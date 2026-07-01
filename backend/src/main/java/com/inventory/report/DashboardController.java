package com.inventory.report;

import com.inventory.common.ApiResponse;
import com.inventory.product.Product;
import com.inventory.product.ProductRepository;
import com.inventory.sale.Sale;
import com.inventory.sale.SaleRepository;
import com.inventory.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class DashboardController {

    private final ProductRepository productRepository;
    private final SaleRepository saleRepository;

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<DashboardStats>> getStats() {
        Long vendorId = SecurityUtils.getCurrentVendorId();
        List<Product> products = productRepository.findByVendorId(vendorId);

        long totalProducts = products.size();
        
        BigDecimal totalStockValue = products.stream()
                .map(p -> p.getCost().multiply(BigDecimal.valueOf(p.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long lowStockItems = products.stream()
                .filter(p -> p.getQuantity() <= p.getReorderLevel())
                .count();

        DashboardStats stats = DashboardStats.builder()
                .totalProducts(totalProducts)
                .totalStockValue(totalStockValue)
                .lowStockItems(lowStockItems)
                .activeUsers(1) // Just a placeholder for now
                .build();

        return ResponseEntity.ok(ApiResponse.success("Dashboard stats fetched", stats));
    }

    @GetMapping("/chart-data")
    public ResponseEntity<ApiResponse<List<ChartData>>> getChartData() {
        Long vendorId = SecurityUtils.getCurrentVendorId();
        List<Sale> sales = saleRepository.findByVendorId(vendorId);
        
        LocalDate sevenDaysAgo = LocalDate.now().minusDays(6); // Include today
        
        // Filter last 7 days and group by date
        Map<LocalDate, BigDecimal> dailyRevenue = sales.stream()
                .filter(s -> !s.getSaleDate().toLocalDate().isBefore(sevenDaysAgo))
                .collect(Collectors.toMap(
                        s -> s.getSaleDate().toLocalDate(),
                        Sale::getTotalAmount,
                        BigDecimal::add
                ));

        List<ChartData> chartData = new ArrayList<>();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMM dd");

        // Ensure all 7 days have an entry even if 0
        for (int i = 6; i >= 0; i--) {
            LocalDate date = LocalDate.now().minusDays(i);
            BigDecimal revenue = dailyRevenue.getOrDefault(date, BigDecimal.ZERO);
            chartData.add(new ChartData(date.format(formatter), revenue));
        }

        return ResponseEntity.ok(ApiResponse.success("Chart data fetched", chartData));
    }
}

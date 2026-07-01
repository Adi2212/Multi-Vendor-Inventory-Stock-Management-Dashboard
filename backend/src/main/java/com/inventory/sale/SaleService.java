package com.inventory.sale;

import com.inventory.customer.Customer;
import com.inventory.customer.CustomerRepository;
import com.inventory.product.Product;
import com.inventory.product.ProductRepository;
import com.inventory.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SaleService {

    private final SaleRepository saleRepository;
    private final ProductRepository productRepository;
    private final CustomerRepository customerRepository;

    public List<Sale> getAllSales() {
        return saleRepository.findByVendorIdOrderBySaleDateDesc(SecurityUtils.getCurrentVendorId());
    }

    public Sale getSaleById(Long id) {
        return saleRepository.findByIdAndVendorId(id, SecurityUtils.getCurrentVendorId())
                .orElseThrow(() -> new RuntimeException("Sale not found"));
    }

    @Transactional
    public Sale createSale(Sale sale) {
        Long vendorId = SecurityUtils.getCurrentVendorId();
        sale.setVendorId(vendorId);

        if (sale.getSaleDate() == null) {
            sale.setSaleDate(java.time.LocalDateTime.now());
        }

        if (sale.getStatus() == null) {
            sale.setStatus("COMPLETED");
        }

        // Resolve Customer
        if (sale.getCustomer() != null && sale.getCustomer().getId() != null) {
            Customer customer = customerRepository.findByIdAndVendorId(sale.getCustomer().getId(), vendorId)
                    .orElseThrow(() -> new RuntimeException("Customer not found"));
            sale.setCustomer(customer);
        } else {
            sale.setCustomer(null);
        }

        BigDecimal totalAmount = BigDecimal.ZERO;

        // Process line items
        if (sale.getItems() != null) {
            for (SaleItem item : sale.getItems()) {
                item.setSale(sale);

                Product product = productRepository.findByIdAndVendorId(item.getProduct().getId(), vendorId)
                        .orElseThrow(() -> new RuntimeException("Product not found"));
                item.setProduct(product);

                // Verify stock
                if (product.getQuantity() < item.getQuantity()) {
                    throw new RuntimeException("Insufficient stock for product: " + product.getName());
                }

                BigDecimal itemTotal = item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
                item.setTotal(itemTotal);
                totalAmount = totalAmount.add(itemTotal);

                // Immediately decrement stock
                product.setQuantity(product.getQuantity() - item.getQuantity());
                productRepository.save(product);
            }
        }

        sale.setTotalAmount(totalAmount);
        return saleRepository.save(sale);
    }
}

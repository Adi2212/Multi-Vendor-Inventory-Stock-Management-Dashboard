package com.inventory.purchase;

import com.inventory.product.Product;
import com.inventory.product.ProductRepository;
import com.inventory.security.SecurityUtils;
import com.inventory.supplier.Supplier;
import com.inventory.supplier.SupplierRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PurchaseService {

    private final PurchaseRepository purchaseRepository;
    private final ProductRepository productRepository;
    private final SupplierRepository supplierRepository;

    public List<Purchase> getAllPurchases() {
        return purchaseRepository.findByVendorIdOrderByOrderDateDesc(SecurityUtils.getCurrentVendorId());
    }

    public Purchase getPurchaseById(Long id) {
        return purchaseRepository.findByIdAndVendorId(id, SecurityUtils.getCurrentVendorId())
                .orElseThrow(() -> new RuntimeException("Purchase not found"));
    }

    @Transactional
    public Purchase createPurchase(Purchase purchase) {
        Long vendorId = SecurityUtils.getCurrentVendorId();
        purchase.setVendorId(vendorId);
        
        // Resolve Supplier
        if (purchase.getSupplier() != null && purchase.getSupplier().getId() != null) {
            Supplier supplier = supplierRepository.findByIdAndVendorId(purchase.getSupplier().getId(), vendorId)
                    .orElseThrow(() -> new RuntimeException("Supplier not found"));
            purchase.setSupplier(supplier);
        } else {
            purchase.setSupplier(null);
        }

        BigDecimal totalAmount = BigDecimal.ZERO;

        // Process line items
        if (purchase.getItems() != null) {
            for (PurchaseItem item : purchase.getItems()) {
                item.setPurchase(purchase);
                
                Product product = productRepository.findByIdAndVendorId(item.getProduct().getId(), vendorId)
                        .orElseThrow(() -> new RuntimeException("Product not found"));
                item.setProduct(product);
                
                BigDecimal itemTotal = item.getUnitCost().multiply(BigDecimal.valueOf(item.getQuantity()));
                item.setTotal(itemTotal);
                totalAmount = totalAmount.add(itemTotal);
                
                // Immediately increment stock
                product.setQuantity(product.getQuantity() + item.getQuantity());
                // Update cost price based on last purchase cost (optional simple strategy)
                product.setCost(item.getUnitCost());
                productRepository.save(product);
            }
        }
        
        if (purchase.getStatus() == null || purchase.getStatus().isEmpty()) {
            purchase.setStatus("COMPLETED");
        }
        
        purchase.setTotalAmount(totalAmount);
        return purchaseRepository.save(purchase);
    }

    @Transactional
    public Purchase updatePurchaseStatus(Long id, String status) {
        Purchase purchase = purchaseRepository.findByIdAndVendorId(id, SecurityUtils.getCurrentVendorId())
                .orElseThrow(() -> new RuntimeException("Purchase not found"));
        purchase.setStatus(status);
        return purchaseRepository.save(purchase);
    }
}

package com.inventory.product;

import com.inventory.category.Category;
import com.inventory.category.CategoryRepository;
import com.inventory.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    public List<Product> getAllProducts() {
        return productRepository.findByVendorId(SecurityUtils.getCurrentVendorId());
    }

    public Product getProductById(Long id) {
        return productRepository.findByIdAndVendorId(id, SecurityUtils.getCurrentVendorId())
                .orElseThrow(() -> new RuntimeException("Product not found"));
    }

    public Product createProduct(Product product) {
        product.setVendorId(SecurityUtils.getCurrentVendorId());
        if (product.getCategory() != null && product.getCategory().getId() != null) {
            Category cat = categoryRepository.findByIdAndVendorId(product.getCategory().getId(), SecurityUtils.getCurrentVendorId())
                    .orElseThrow(() -> new RuntimeException("Category not found or access denied"));
            product.setCategory(cat);
        }
        return productRepository.save(product);
    }

    public Product updateProduct(Long id, Product productDetails) {
        Product product = getProductById(id);
        
        if (productDetails.getCategory() != null && productDetails.getCategory().getId() != null) {
            Category cat = categoryRepository.findByIdAndVendorId(productDetails.getCategory().getId(), SecurityUtils.getCurrentVendorId())
                    .orElseThrow(() -> new RuntimeException("Category not found or access denied"));
            product.setCategory(cat);
        } else {
            product.setCategory(null);
        }

        product.setName(productDetails.getName());
        product.setSku(productDetails.getSku());
        product.setBarcode(productDetails.getBarcode());
        product.setDescription(productDetails.getDescription());
        product.setPrice(productDetails.getPrice());
        product.setCost(productDetails.getCost());
        product.setQuantity(productDetails.getQuantity());
        product.setReorderLevel(productDetails.getReorderLevel());
        
        return productRepository.save(product);
    }

    public void deleteProduct(Long id) {
        productRepository.delete(getProductById(id));
    }
}

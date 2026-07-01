package com.inventory.purchase;

import com.inventory.common.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/purchases")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PurchaseController {

    private final PurchaseService purchaseService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Purchase>>> getAllPurchases() {
        return ResponseEntity.ok(ApiResponse.success("Purchases fetched", purchaseService.getAllPurchases()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Purchase>> getPurchaseById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Purchase fetched", purchaseService.getPurchaseById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Purchase>> createPurchase(@RequestBody Purchase purchase) {
        return ResponseEntity.ok(ApiResponse.success("Purchase created", purchaseService.createPurchase(purchase)));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<Purchase>> updatePurchaseStatus(@PathVariable Long id, @RequestBody java.util.Map<String, String> body) {
        String status = body.get("status");
        return ResponseEntity.ok(ApiResponse.success("Purchase status updated", purchaseService.updatePurchaseStatus(id, status)));
    }
}

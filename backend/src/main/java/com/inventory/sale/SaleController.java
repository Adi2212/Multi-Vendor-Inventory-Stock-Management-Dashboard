package com.inventory.sale;

import com.inventory.common.ApiResponse;
import com.inventory.report.InvoiceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sales")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class SaleController {

    private final SaleService saleService;
    private final InvoiceService invoiceService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Sale>>> getAllSales() {
        return ResponseEntity.ok(ApiResponse.success("Sales fetched successfully", saleService.getAllSales()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Sale>> getSaleById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Sale fetched successfully", saleService.getSaleById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Sale>> createSale(@RequestBody Sale sale) {
        return ResponseEntity.ok(ApiResponse.success("Sale processed successfully", saleService.createSale(sale)));
    }

    @GetMapping("/{id}/invoice")
    public ResponseEntity<byte[]> downloadInvoice(@PathVariable Long id) {
        try {
            byte[] pdfBytes = invoiceService.generateInvoice(id, com.inventory.security.SecurityUtils.getCurrentVendorId());
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", "Invoice-INV-" + String.format("%04d", id) + ".pdf");
            return ResponseEntity.ok().headers(headers).body(pdfBytes);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}

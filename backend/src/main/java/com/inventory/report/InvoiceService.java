package com.inventory.report;

import com.inventory.sale.Sale;
import com.inventory.sale.SaleItem;
import com.inventory.sale.SaleRepository;
import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
public class InvoiceService {

    private final SaleRepository saleRepository;

    public byte[] generateInvoice(Long saleId, Long vendorId) throws Exception {
        Sale sale = saleRepository.findByIdAndVendorId(saleId, vendorId)
                .orElseThrow(() -> new RuntimeException("Sale not found"));

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        Document document = new Document(PageSize.A4);
        PdfWriter.getInstance(document, baos);

        document.open();

        // Fonts
        Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 20, Color.BLACK);
        Font subTitleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14, Color.DARK_GRAY);
        Font regularFont = FontFactory.getFont(FontFactory.HELVETICA, 12, Color.BLACK);
        Font boldFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, Color.BLACK);

        // Header: Generic Company Name
        Paragraph companyName = new Paragraph("INVO SaaS", titleFont);
        companyName.setAlignment(Element.ALIGN_CENTER);
        companyName.setSpacingAfter(20);
        document.add(companyName);

        // Invoice Title
        Paragraph invoiceTitle = new Paragraph("INVOICE", subTitleFont);
        invoiceTitle.setAlignment(Element.ALIGN_CENTER);
        invoiceTitle.setSpacingAfter(20);
        document.add(invoiceTitle);

        // Invoice Details
        PdfPTable infoTable = new PdfPTable(2);
        infoTable.setWidthPercentage(100);
        infoTable.setSpacingAfter(20);

        PdfPCell cell1 = new PdfPCell(new Paragraph("Invoice #: INV-" + String.format("%04d", sale.getId()), boldFont));
        cell1.setBorder(Rectangle.NO_BORDER);
        infoTable.addCell(cell1);

        String dateStr = sale.getSaleDate().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm"));
        PdfPCell cell2 = new PdfPCell(new Paragraph("Date: " + dateStr, regularFont));
        cell2.setBorder(Rectangle.NO_BORDER);
        cell2.setHorizontalAlignment(Element.ALIGN_RIGHT);
        infoTable.addCell(cell2);

        String customerName = sale.getCustomer() != null ? sale.getCustomer().getName() : "Walk-in Customer";
        PdfPCell cell3 = new PdfPCell(new Paragraph("Customer: " + customerName, regularFont));
        cell3.setBorder(Rectangle.NO_BORDER);
        infoTable.addCell(cell3);

        PdfPCell cell4 = new PdfPCell(new Paragraph("Status: " + sale.getStatus(), regularFont));
        cell4.setBorder(Rectangle.NO_BORDER);
        cell4.setHorizontalAlignment(Element.ALIGN_RIGHT);
        infoTable.addCell(cell4);

        document.add(infoTable);

        // Items Table
        PdfPTable table = new PdfPTable(4);
        table.setWidthPercentage(100);
        table.setWidths(new float[]{4f, 1.5f, 2f, 2.5f});
        table.setSpacingBefore(10);
        table.setSpacingAfter(20);

        // Table Header
        addTableHeader(table, "Item", boldFont);
        addTableHeader(table, "Qty", boldFont);
        addTableHeader(table, "Unit Price", boldFont);
        addTableHeader(table, "Total", boldFont);

        // Table Rows
        for (SaleItem item : sale.getItems()) {
            addTableCell(table, item.getProduct().getName(), regularFont, Element.ALIGN_LEFT);
            addTableCell(table, String.valueOf(item.getQuantity()), regularFont, Element.ALIGN_CENTER);
            addTableCell(table, "$" + item.getUnitPrice().toString(), regularFont, Element.ALIGN_RIGHT);
            BigDecimal rowTotal = item.getUnitPrice().multiply(new BigDecimal(item.getQuantity()));
            addTableCell(table, "$" + rowTotal.toString(), regularFont, Element.ALIGN_RIGHT);
        }

        document.add(table);

        // Total
        Paragraph totalPara = new Paragraph("Grand Total: $" + sale.getTotalAmount().toString(), titleFont);
        totalPara.setAlignment(Element.ALIGN_RIGHT);
        document.add(totalPara);

        // Footer
        Paragraph footer = new Paragraph("Thank you for your business!", regularFont);
        footer.setAlignment(Element.ALIGN_CENTER);
        footer.setSpacingBefore(50);
        document.add(footer);

        document.close();
        return baos.toByteArray();
    }

    private void addTableHeader(PdfPTable table, String headerTitle, Font font) {
        PdfPCell header = new PdfPCell(new Phrase(headerTitle, font));
        header.setBackgroundColor(Color.LIGHT_GRAY);
        header.setHorizontalAlignment(Element.ALIGN_CENTER);
        header.setPadding(8);
        table.addCell(header);
    }

    private void addTableCell(PdfPTable table, String text, Font font, int alignment) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setHorizontalAlignment(alignment);
        cell.setPadding(8);
        table.addCell(cell);
    }
}

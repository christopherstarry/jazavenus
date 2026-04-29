using Jaza.Domain.Invoicing;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace Jaza.Api.Pdf;

public static class InvoicePdf
{
    public static byte[] Render(Invoice inv)
    {
        QuestPDF.Settings.License = LicenseType.Community;

        return Document.Create(c =>
        {
            c.Page(p =>
            {
                p.Margin(36);
                p.Size(PageSizes.A4);
                p.DefaultTextStyle(t => t.FontSize(10).FontFamily("Helvetica"));

                p.Header().Element(h =>
                {
                    h.Row(r =>
                    {
                        r.RelativeItem().Column(col =>
                        {
                            col.Item().Text("INVOICE").FontSize(20).Bold();
                            col.Item().Text($"#{inv.Number}").FontSize(12);
                        });
                        r.RelativeItem().AlignRight().Column(col =>
                        {
                            col.Item().Text("Jaza Venus").FontSize(12).Bold();
                            col.Item().Text("Warehouse Management");
                        });
                    });
                });

                p.Content().Element(co =>
                {
                    co.Column(col =>
                    {
                        col.Spacing(10);
                        col.Item().Row(r =>
                        {
                            r.RelativeItem().Column(c =>
                            {
                                c.Item().Text("Bill to:").Bold();
                                c.Item().Text(inv.Customer?.Name ?? "");
                                c.Item().Text(inv.Customer?.BillingAddress ?? "");
                            });
                            r.RelativeItem().AlignRight().Column(c =>
                            {
                                c.Item().Text($"Issue date: {inv.IssueDate:yyyy-MM-dd}");
                                c.Item().Text($"Due date:   {inv.DueDate:yyyy-MM-dd}");
                                c.Item().Text($"Currency:   {inv.Currency}");
                            });
                        });

                        col.Item().Table(t =>
                        {
                            t.ColumnsDefinition(cd =>
                            {
                                cd.ConstantColumn(28);
                                cd.RelativeColumn(5);
                                cd.RelativeColumn(1);
                                cd.RelativeColumn(2);
                                cd.RelativeColumn(1);
                                cd.RelativeColumn(2);
                            });
                            t.Header(h =>
                            {
                                h.Cell().Text("#").Bold();
                                h.Cell().Text("Description").Bold();
                                h.Cell().AlignRight().Text("Qty").Bold();
                                h.Cell().AlignRight().Text("Unit price").Bold();
                                h.Cell().AlignRight().Text("Tax %").Bold();
                                h.Cell().AlignRight().Text("Line total").Bold();
                            });
                            foreach (var l in inv.Lines.OrderBy(l => l.LineNumber))
                            {
                                t.Cell().Text(l.LineNumber.ToString());
                                t.Cell().Text(l.Description);
                                t.Cell().AlignRight().Text($"{l.Quantity:0.####}");
                                t.Cell().AlignRight().Text($"{l.UnitPrice:0.0000}");
                                t.Cell().AlignRight().Text($"{l.TaxPercent:0.##}");
                                t.Cell().AlignRight().Text($"{l.LineTotal:0.0000}");
                            }
                        });

                        col.Item().AlignRight().Column(c =>
                        {
                            c.Item().Text($"Subtotal: {inv.SubTotal:0.0000} {inv.Currency}");
                            c.Item().Text($"Tax:      {inv.TaxTotal:0.0000} {inv.Currency}");
                            c.Item().Text($"Total:    {inv.GrandTotal:0.0000} {inv.Currency}").Bold();
                            c.Item().Text($"Paid:     {inv.AmountPaid:0.0000} {inv.Currency}");
                            c.Item().Text($"Due:      {inv.AmountDue:0.0000} {inv.Currency}").Bold();
                        });

                        if (!string.IsNullOrWhiteSpace(inv.Notes))
                            col.Item().Text(inv.Notes);
                    });
                });

                p.Footer().AlignCenter().Text(t =>
                {
                    t.Span("Page ");
                    t.CurrentPageNumber();
                    t.Span(" of ");
                    t.TotalPages();
                });
            });
        }).GeneratePdf();
    }
}

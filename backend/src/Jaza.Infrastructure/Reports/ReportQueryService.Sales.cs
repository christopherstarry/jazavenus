using Jaza.Application.Reports;
using Jaza.Domain.Common;
using Jaza.Domain.Inbound;
using Jaza.Domain.Invoicing;
using Jaza.Domain.Outbound;
using Jaza.Domain.Pricing;
using Jaza.Domain.Returns;
using Microsoft.EntityFrameworkCore;

namespace Jaza.Infrastructure.Reports;

public sealed partial class ReportQueryService
{
    private async Task<ReportQueryResult> ExecuteSalesAsync(ReportQueryContext ctx, string key, CancellationToken ct) =>
        key switch
        {
            "product-selling" => await SalesProductSelling(ctx, ct),
            "sales-report" => await SalesSummary(ctx, ct),
            "detail-transaction" => await SalesDetailTransaction(ctx, ct),
            "recapitulation-sales-return" => await SalesRecapByBrand(ctx, ct),
            "recapitulation-sales-return-by-brand" => await SalesRecapByBrand(ctx, ct),
            "recapitulation-sales-return-by-customer" => await SalesRecapByCustomer(ctx, ct),
            "recapitulation-sales-return-by-salesman" => await SalesRecapBySalesman(ctx, ct),
            "recapitulation-sales-return-by-customer-status" => await SalesRecapByCustomerStatus(ctx, ct),
            "sales-return-report" => await SalesReturnReport(ctx, ct),
            "sales-bonus" => await SalesBonus(ctx, ct),
            "sales-purchase-return" => await SalesPurchaseReturn(ctx, ct),
            "sales-time-series" => await SalesTimeSeries(ctx, ct),
            "daily-sales" => await SalesDaily(ctx, ct),
            "gross-margin" => await SalesGrossMargin(ctx, ct),
            "makarizo" => await SalesMakarizo(ctx, ct),
            "customer-by-ca" => await SalesCustomerByCa(ctx, ct),
            "cust-number-of-outlet" => await SalesCustOutletCount(ctx, ct),
            "sales-by-market" => await SalesByMarket(ctx, ct),
            "order-plan" => await SalesOrderPlan(ctx, ct),
            "service-level" => await SalesServiceLevel(ctx, ct),
            "check-order-vs-invoice" => await SalesCheckOrderVsInvoice(ctx, ct),
            "discount-per-customer" => await SalesDiscountPerCustomer(ctx, ct),
            "register-book" => await SalesRegisterBook(ctx, ct),
            "order-card" => await SalesOrderCard(ctx, ct),
            "daily-selling" => await SalesDailySelling(ctx, ct),
            "monthly-selling" => await SalesMonthlySelling(ctx, ct),
            "tax-invoice-summary" => await SalesTaxInvoiceSummary(ctx, ct),
            "trade-promo" => await SalesTradePromo(ctx, ct),
            "extra-discount-report" => await SalesExtraDiscount(ctx, ct),
            "back-order" => await SalesBackOrder(ctx, ct),
            "consignment-register" => await SalesConsignmentRegister(ctx, ct),
            "invoice-register" => await SalesInvoiceRegister(ctx, ct),
            "delivery-order-register" => await SalesDoRegister(ctx, ct),
            "sales-order-register" => await SalesSoRegister(ctx, ct),
            "sales-by-brand" => await SalesByBrand(ctx, ct),
            "sales-by-salesman" => await SalesBySalesman(ctx, ct),
            "sales-by-area" => await SalesByArea(ctx, ct),
            "sales-by-customer" => await SalesByCustomer(ctx, ct),
            "customer-statement" => await SalesCustomerStatement(ctx, ct),
            "salesman-target" => await SalesSalesmanTarget(ctx, ct),
            "top-customers" => await SalesTopCustomers(ctx, ct),
            "top-products" => await SalesTopProducts(ctx, ct),
            "pending-delivery" => await SalesPendingDelivery(ctx, ct),
            "cancelled-orders" => await SalesCancelledOrders(ctx, ct),
            "sales-comparison" => await SalesComparison(ctx, ct),
            _ => throw new DomainException($"Unknown sales report: {key}"),
        };

    private async Task<ReportQueryResult> SalesProductSelling(ReportQueryContext ctx, CancellationToken ct)
    {
        var q = from l in ctx.Db.InvoiceLines.AsNoTracking()
                join i in ctx.Invoices() on l.InvoiceId equals i.Id
                where !l.IsDeleted
                select new { l, i };
        if (ctx.ItemId.HasValue) q = q.Where(x => x.l.ItemId == ctx.ItemId);
        var grouped = q.GroupBy(x => new { x.l.ItemId, x.l.Description })
            .Select(g => new
            {
                g.Key.ItemId,
                g.Key.Description,
                Qty = g.Sum(x => x.l.Quantity),
                Amount = g.Sum(x => x.l.LineTotal),
            })
            .OrderByDescending(x => x.Amount);
        return await ctx.PageAsync(grouped, x => ReportQueryContext.Row(
            ("itemId", x.ItemId), ("description", x.Description), ("quantity", x.Qty), ("amount", x.Amount)), ct);
    }

    private async Task<ReportQueryResult> SalesSummary(ReportQueryContext ctx, CancellationToken ct)
    {
        var q = ctx.Invoices().Include(i => i.Customer).OrderByDescending(i => i.IssueDate);
        return await ctx.PageAsync(q, i => ReportQueryContext.Row(
            ("invoiceNumber", i.Number), ("issueDate", i.IssueDate), ("customerCode", i.Customer!.Code),
            ("customerName", i.Customer.Name), ("division", i.Division), ("status", i.Status.ToString()),
            ("subTotal", i.SubTotal), ("taxTotal", i.TaxTotal), ("grandTotal", i.GrandTotal),
            ("amountDue", i.AmountDue)), ct);
    }

    private async Task<ReportQueryResult> SalesDetailTransaction(ReportQueryContext ctx, CancellationToken ct)
    {
        var q = from l in ctx.Db.InvoiceLines.AsNoTracking()
                join i in ctx.Invoices() on l.InvoiceId equals i.Id
                join c in ctx.Db.Customers.AsNoTracking() on i.CustomerId equals c.Id
                where !l.IsDeleted
                orderby i.IssueDate descending, i.Number, l.LineNumber
                select new { l, i, c };
        if (ctx.ItemId.HasValue) q = q.Where(x => x.l.ItemId == ctx.ItemId);
        var total = await q.CountAsync(ct);
        var rows = await q.Skip(ctx.Skip).Take(ctx.PageSize).ToListAsync(ct);
        return ctx.Result(rows.Select(x => ReportQueryContext.Row(
            ("invoiceNumber", x.i.Number), ("issueDate", x.i.IssueDate), ("customerCode", x.c.Code),
            ("lineNumber", x.l.LineNumber), ("description", x.l.Description), ("quantity", x.l.Quantity),
            ("unitPrice", x.l.UnitPrice), ("discountPercent", x.l.DiscountPercent),
            ("lineTotal", x.l.LineTotal))).ToList(), total);
    }

    private async Task<ReportQueryResult> SalesRecapByBrand(ReportQueryContext ctx, CancellationToken ct)
    {
        var sales = from l in ctx.Db.InvoiceLines.AsNoTracking()
                    join i in ctx.Invoices() on l.InvoiceId equals i.Id
                    join it in ctx.Db.Items.AsNoTracking() on l.ItemId equals it.Id into items
                    from it in items.DefaultIfEmpty()
                    join cat in ctx.Db.Categories.AsNoTracking() on it!.CategoryId equals cat.Id into cats
                    from cat in cats.DefaultIfEmpty()
                    where !l.IsDeleted
                    group l by cat != null ? cat.Name : "Uncategorized" into g
                    select new { Brand = g.Key, SalesQty = g.Sum(x => x.Quantity), SalesAmount = g.Sum(x => x.LineTotal) };
        var returns = from l in ctx.Db.SalesReturnLines.AsNoTracking()
                      join r in ctx.Db.SalesReturns.AsNoTracking() on l.SalesReturnId equals r.Id
                      where !l.IsDeleted && !r.IsDeleted && r.Status == DocumentStatus.Posted
                      group l by "All" into g
                      select new { ReturnQty = g.Sum(x => x.Quantity), ReturnAmount = g.Sum(x => x.Quantity * x.UnitPrice) };
        var salesList = await sales.ToListAsync(ct);
        var ret = await returns.FirstOrDefaultAsync(ct);
        var rows = salesList.Select(s => ReportQueryContext.Row(
            ("brand", s.Brand), ("salesQty", s.SalesQty), ("salesAmount", s.SalesAmount),
            ("returnQty", ret?.ReturnQty ?? 0m), ("returnAmount", ret?.ReturnAmount ?? 0m))).ToList();
        return ctx.Result(rows, rows.Count);
    }

    private async Task<ReportQueryResult> SalesRecapByCustomer(ReportQueryContext ctx, CancellationToken ct)
    {
        var q = ctx.Invoices().GroupBy(i => new { i.CustomerId, i.Customer!.Code, i.Customer.Name })
            .Select(g => new
            {
                g.Key.CustomerId, g.Key.Code, g.Key.Name,
                InvoiceCount = g.Count(), Amount = g.Sum(x => x.GrandTotal),
            }).OrderByDescending(x => x.Amount);
        return await ctx.PageAsync(q, x => ReportQueryContext.Row(
            ("customerId", x.CustomerId), ("customerCode", x.Code), ("customerName", x.Name),
            ("invoiceCount", x.InvoiceCount), ("amount", x.Amount)), ct);
    }

    private async Task<ReportQueryResult> SalesRecapBySalesman(ReportQueryContext ctx, CancellationToken ct)
    {
        var q = from i in ctx.Invoices()
                join c in ctx.Db.Customers.AsNoTracking() on i.CustomerId equals c.Id
                group i by c.SalesmanCode into g
                select new { SalesmanCode = g.Key ?? "", InvoiceCount = g.Count(), Amount = g.Sum(x => x.GrandTotal) };
        return await ctx.PageAsync(q.OrderByDescending(x => x.Amount), x => ReportQueryContext.Row(
            ("salesmanCode", x.SalesmanCode), ("invoiceCount", x.InvoiceCount), ("amount", x.Amount)), ct);
    }

    private async Task<ReportQueryResult> SalesRecapByCustomerStatus(ReportQueryContext ctx, CancellationToken ct)
    {
        var q = ctx.Invoices().GroupBy(i => new { i.CustomerId, i.Customer!.Code, i.Status })
            .Select(g => new
            {
                g.Key.CustomerId, g.Key.Code, Status = g.Key.Status.ToString(),
                Count = g.Count(), Amount = g.Sum(x => x.GrandTotal),
            });
        return await ctx.PageAsync(q, x => ReportQueryContext.Row(
            ("customerId", x.CustomerId), ("customerCode", x.Code), ("status", x.Status),
            ("count", x.Count), ("amount", x.Amount)), ct);
    }

    private async Task<ReportQueryResult> SalesReturnReport(ReportQueryContext ctx, CancellationToken ct)
    {
        var q = ctx.ApplyDivision(ctx.Db.SalesReturns.AsNoTracking().Where(r => !r.IsDeleted && r.Status == DocumentStatus.Posted), r => r.Division);
        if (ctx.From.HasValue) q = q.Where(r => r.ReturnDate >= ctx.From.Value);
        if (ctx.To.HasValue) q = q.Where(r => r.ReturnDate <= ctx.To.Value);
        if (ctx.CustomerId.HasValue) q = q.Where(r => r.CustomerId == ctx.CustomerId);
        q = q.Include(r => r.Customer).OrderByDescending(r => r.ReturnDate);
        return await ctx.PageAsync(q, r => ReportQueryContext.Row(
            ("returnNumber", r.Number), ("returnDate", r.ReturnDate), ("customerCode", r.Customer!.Code),
            ("status", r.Status.ToString()), ("lineCount", r.Lines.Count)), ct);
    }

    private async Task<ReportQueryResult> SalesBonus(ReportQueryContext ctx, CancellationToken ct)
    {
        var q = from l in ctx.Db.InvoiceLines.AsNoTracking()
                join i in ctx.Invoices() on l.InvoiceId equals i.Id
                where !l.IsDeleted && l.DiscountPercent > 0
                group l by l.DiscountPercent into g
                select new { DiscountPercent = g.Key, LineCount = g.Count(), BonusValue = g.Sum(x => x.Quantity * x.UnitPrice * x.DiscountPercent / 100m) };
        var list = await q.OrderByDescending(x => x.BonusValue).ToListAsync(ct);
        return ctx.Result(list.Select(x => ReportQueryContext.Row(
            ("discountPercent", x.DiscountPercent), ("lineCount", x.LineCount), ("bonusValue", x.BonusValue))).ToList(), list.Count);
    }

    private async Task<ReportQueryResult> SalesPurchaseReturn(ReportQueryContext ctx, CancellationToken ct)
    {
        var q = ctx.ApplyDivision(ctx.Db.PurchaseReturns.AsNoTracking().Where(r => !r.IsDeleted), r => r.Division);
        if (ctx.From.HasValue) q = q.Where(r => r.ReturnDate >= ctx.From.Value);
        if (ctx.To.HasValue) q = q.Where(r => r.ReturnDate <= ctx.To.Value);
        q = q.Include(r => r.Supplier).OrderByDescending(r => r.ReturnDate);
        return await ctx.PageAsync(q, r => ReportQueryContext.Row(
            ("returnNumber", r.Number), ("returnDate", r.ReturnDate), ("supplierCode", r.Supplier!.Code),
            ("status", r.Status.ToString())), ct);
    }

    private async Task<ReportQueryResult> SalesTimeSeries(ReportQueryContext ctx, CancellationToken ct)
    {
        var q = ctx.Invoices().GroupBy(i => i.IssueDate.Date)
            .Select(g => new { Date = g.Key, Count = g.Count(), Amount = g.Sum(x => x.GrandTotal) })
            .OrderBy(x => x.Date);
        var list = await q.ToListAsync(ct);
        return ctx.Result(list.Select(x => ReportQueryContext.Row(
            ("date", x.Date), ("invoiceCount", x.Count), ("amount", x.Amount))).ToList(), list.Count);
    }

    private async Task<ReportQueryResult> SalesDaily(ReportQueryContext ctx, CancellationToken ct) =>
        await SalesTimeSeries(ctx, ct);

    private async Task<ReportQueryResult> SalesGrossMargin(ReportQueryContext ctx, CancellationToken ct)
    {
        var q = from l in ctx.Db.InvoiceLines.AsNoTracking()
                join i in ctx.Invoices() on l.InvoiceId equals i.Id
                join it in ctx.Db.Items.AsNoTracking() on l.ItemId equals it.Id into items
                from it in items.DefaultIfEmpty()
                where !l.IsDeleted
                select new { l, Cost = it != null ? it.StandardCost : 0m };
        var rows = await q.GroupBy(x => x.l.Description).Select(g => new
        {
            Description = g.Key,
            Revenue = g.Sum(x => x.l.LineTotal),
            Cost = g.Sum(x => x.l.Quantity * x.Cost),
        }).ToListAsync(ct);
        return ctx.Result(rows.Select(x => ReportQueryContext.Row(
            ("description", x.Description), ("revenue", x.Revenue), ("cost", x.Cost),
            ("margin", x.Revenue - x.Cost), ("marginPercent", x.Revenue > 0 ? (x.Revenue - x.Cost) / x.Revenue * 100m : 0m))).ToList(), rows.Count);
    }

    private async Task<ReportQueryResult> SalesMakarizo(ReportQueryContext ctx, CancellationToken ct)
    {
        var brandCustomers = ctx.Db.BrandDiscounts.AsNoTracking()
            .Where(b => b.IsActive && b.BrandCode.Contains("MAKARIZO"))
            .Select(b => b.CustomerId).Distinct();
        var q = ctx.Invoices().Where(i => brandCustomers.Contains(i.CustomerId));
        return await ctx.PageAsync(q.Include(i => i.Customer), i => ReportQueryContext.Row(
            ("invoiceNumber", i.Number), ("issueDate", i.IssueDate), ("customerCode", i.Customer!.Code),
            ("grandTotal", i.GrandTotal)), ct);
    }

    private async Task<ReportQueryResult> SalesCustomerByCa(ReportQueryContext ctx, CancellationToken ct)
    {
        var q = ctx.Db.Customers.AsNoTracking().Where(c => c.IsActive && !c.IsDeleted)
            .GroupBy(c => c.CollectorCode)
            .Select(g => new { CollectorCode = g.Key ?? "", CustomerCount = g.Count() })
            .OrderBy(x => x.CollectorCode);
        return await ctx.PageAsync(q, x => ReportQueryContext.Row(
            ("collectorCode", x.CollectorCode), ("customerCount", x.CustomerCount)), ct);
    }

    private async Task<ReportQueryResult> SalesCustOutletCount(ReportQueryContext ctx, CancellationToken ct)
    {
        var q = ctx.Db.Customers.AsNoTracking().Where(c => c.IsActive && !c.IsDeleted)
            .GroupBy(c => c.OutletType)
            .Select(g => new { OutletType = g.Key ?? "", Count = g.Count() });
        var list = await q.ToListAsync(ct);
        return ctx.Result(list.Select(x => ReportQueryContext.Row(
            ("outletType", x.OutletType), ("count", x.Count))).ToList(), list.Count);
    }

    private async Task<ReportQueryResult> SalesByMarket(ReportQueryContext ctx, CancellationToken ct)
    {
        var q = from i in ctx.Invoices()
                join c in ctx.Db.Customers.AsNoTracking() on i.CustomerId equals c.Id
                group i by c.TradeType into g
                select new { Market = g.Key ?? "", Amount = g.Sum(x => x.GrandTotal), Count = g.Count() };
        return await ctx.PageAsync(q.OrderByDescending(x => x.Amount), x => ReportQueryContext.Row(
            ("market", x.Market), ("invoiceCount", x.Count), ("amount", x.Amount)), ct);
    }

    private async Task<ReportQueryResult> SalesOrderPlan(ReportQueryContext ctx, CancellationToken ct)
    {
        var q = ctx.SalesOrders().Where(s => s.Status == DocumentStatus.Posted)
            .Include(s => s.Customer).OrderBy(s => s.RequestedDate);
        return await ctx.PageAsync(q, s => ReportQueryContext.Row(
            ("orderNumber", s.Number), ("orderDate", s.OrderDate), ("requestedDate", s.RequestedDate),
            ("customerCode", s.Customer!.Code), ("grandTotal", s.GrandTotal)), ct);
    }

    private async Task<ReportQueryResult> SalesServiceLevel(ReportQueryContext ctx, CancellationToken ct)
    {
        var q = from l in ctx.Db.SalesOrderLines.AsNoTracking()
                join s in ctx.SalesOrders() on l.SalesOrderId equals s.Id
                where !l.IsDeleted && l.Quantity > 0
                group l by s.Number into g
                select new
                {
                    OrderNumber = g.Key,
                    Ordered = g.Sum(x => x.Quantity),
                    Delivered = g.Sum(x => x.QuantityDelivered),
                };
        var list = await q.ToListAsync(ct);
        return ctx.Result(list.Select(x => ReportQueryContext.Row(
            ("orderNumber", x.OrderNumber), ("orderedQty", x.Ordered), ("deliveredQty", x.Delivered),
            ("serviceLevelPercent", x.Ordered > 0 ? x.Delivered / x.Ordered * 100m : 0m))).ToList(), list.Count);
    }

    private async Task<ReportQueryResult> SalesCheckOrderVsInvoice(ReportQueryContext ctx, CancellationToken ct)
    {
        var orders = await ctx.SalesOrders().GroupBy(s => s.CustomerId)
            .Select(g => new { g.Key, OrderTotal = g.Sum(x => x.GrandTotal) }).ToListAsync(ct);
        var invoices = await ctx.Invoices().GroupBy(i => i.CustomerId)
            .Select(g => new { g.Key, InvoiceTotal = g.Sum(x => x.GrandTotal) }).ToListAsync(ct);
        var invMap = invoices.ToDictionary(x => x.Key, x => x.InvoiceTotal);
        var rows = orders.Select(o => ReportQueryContext.Row(
            ("customerId", o.Key),
            ("orderTotal", o.OrderTotal),
            ("invoiceTotal", invMap.GetValueOrDefault(o.Key, 0m)),
            ("variance", o.OrderTotal - invMap.GetValueOrDefault(o.Key, 0m)))).ToList();
        return ctx.Result(rows, rows.Count);
    }

    private async Task<ReportQueryResult> SalesDiscountPerCustomer(ReportQueryContext ctx, CancellationToken ct)
    {
        var q = from l in ctx.Db.InvoiceLines.AsNoTracking()
                join i in ctx.Invoices() on l.InvoiceId equals i.Id
                join c in ctx.Db.Customers.AsNoTracking() on i.CustomerId equals c.Id
                where !l.IsDeleted
                group l by new { c.Id, c.Code, c.Name } into g
                select new
                {
                    g.Key.Id, g.Key.Code, g.Key.Name,
                    AvgDiscount = g.Average(x => x.DiscountPercent),
                    DiscountValue = g.Sum(x => x.Quantity * x.UnitPrice * x.DiscountPercent / 100m),
                };
        return await ctx.PageAsync(q.OrderByDescending(x => x.DiscountValue), x => ReportQueryContext.Row(
            ("customerCode", x.Code), ("customerName", x.Name), ("avgDiscountPercent", x.AvgDiscount),
            ("discountValue", x.DiscountValue)), ct);
    }

    private async Task<ReportQueryResult> SalesRegisterBook(ReportQueryContext ctx, CancellationToken ct) =>
        await SalesSummary(ctx, ct);

    private async Task<ReportQueryResult> SalesOrderCard(ReportQueryContext ctx, CancellationToken ct)
    {
        var q = ctx.SalesOrders().Include(s => s.Customer).Include(s => s.Lines).OrderByDescending(s => s.OrderDate);
        return await ctx.PageAsync(q, s => ReportQueryContext.Row(
            ("orderNumber", s.Number), ("orderDate", s.OrderDate), ("customerCode", s.Customer!.Code),
            ("lineCount", s.Lines.Count), ("grandTotal", s.GrandTotal), ("status", s.Status.ToString())), ct);
    }

    private async Task<ReportQueryResult> SalesDailySelling(ReportQueryContext ctx, CancellationToken ct) =>
        await SalesTimeSeries(ctx, ct);

    private async Task<ReportQueryResult> SalesMonthlySelling(ReportQueryContext ctx, CancellationToken ct)
    {
        var q = ctx.Invoices().GroupBy(i => new { i.IssueDate.Year, i.IssueDate.Month })
            .Select(g => new { g.Key.Year, g.Key.Month, Count = g.Count(), Amount = g.Sum(x => x.GrandTotal) })
            .OrderBy(x => x.Year).ThenBy(x => x.Month);
        var list = await q.ToListAsync(ct);
        return ctx.Result(list.Select(x => ReportQueryContext.Row(
            ("year", x.Year), ("month", x.Month), ("invoiceCount", x.Count), ("amount", x.Amount))).ToList(), list.Count);
    }

    private async Task<ReportQueryResult> SalesTaxInvoiceSummary(ReportQueryContext ctx, CancellationToken ct)
    {
        var q = ctx.Invoices().Where(i => i.TaxSerial != null)
            .GroupBy(i => i.TaxSerial)
            .Select(g => new { TaxSerial = g.Key, Count = g.Count(), TaxTotal = g.Sum(x => x.TaxTotal) });
        return await ctx.PageAsync(q, x => ReportQueryContext.Row(
            ("taxSerial", x.TaxSerial), ("invoiceCount", x.Count), ("taxTotal", x.TaxTotal)), ct);
    }

    private async Task<ReportQueryResult> SalesTradePromo(ReportQueryContext ctx, CancellationToken ct)
    {
        var q = ctx.ApplyDivision(ctx.Db.ExtraDiscounts.AsNoTracking().Where(e => e.IsActive), e => e.Division);
        if (ctx.From.HasValue) q = q.Where(e => e.EffectiveFrom >= ctx.From.Value);
        return await ctx.PageAsync(q.OrderBy(e => e.Code), e => ReportQueryContext.Row(
            ("code", e.Code), ("name", e.Name), ("effectiveFrom", e.EffectiveFrom),
            ("effectiveTo", e.EffectiveTo), ("lineCount", e.Lines.Count)), ct);
    }

    private async Task<ReportQueryResult> SalesExtraDiscount(ReportQueryContext ctx, CancellationToken ct)
    {
        var q = from l in ctx.Db.ExtraDiscountLines.AsNoTracking()
                join e in ctx.Db.ExtraDiscounts.AsNoTracking() on l.ExtraDiscountId equals e.Id
                where !l.IsDeleted && e.IsActive
                select new { e.Code, e.Name, e.Division, l.CustomerId, l.BrandId, l.Discount2Percent, l.Discount3Percent };
        if (ctx.Division is not null) q = q.Where(x => x.Division == ctx.Division);
        var total = await q.CountAsync(ct);
        var list = await q.Skip(ctx.Skip).Take(ctx.PageSize).ToListAsync(ct);
        return ctx.Result(list.Select(x => ReportQueryContext.Row(
            ("promoCode", x.Code), ("promoName", x.Name), ("customerId", x.CustomerId),
            ("discount2Percent", x.Discount2Percent), ("discount3Percent", x.Discount3Percent))).ToList(), total);
    }

    private async Task<ReportQueryResult> SalesBackOrder(ReportQueryContext ctx, CancellationToken ct)
    {
        var q = from l in ctx.Db.SalesOrderLines.AsNoTracking()
                join s in ctx.SalesOrders() on l.SalesOrderId equals s.Id
                join c in ctx.Db.Customers.AsNoTracking() on s.CustomerId equals c.Id
                join it in ctx.Db.Items.AsNoTracking() on l.ItemId equals it.Id
                where !l.IsDeleted && l.QuantityOpen > 0
                orderby s.OrderDate
                select new { s.Number, s.OrderDate, c.Code, it.Name, l.QuantityOpen, l.UnitPrice };
        var total = await q.CountAsync(ct);
        var rows = await q.Skip(ctx.Skip).Take(ctx.PageSize).ToListAsync(ct);
        return ctx.Result(rows.Select(x => ReportQueryContext.Row(
            ("orderNumber", x.Number), ("orderDate", x.OrderDate), ("customerCode", x.Code),
            ("itemName", x.Name), ("openQty", x.QuantityOpen), ("unitPrice", x.UnitPrice))).ToList(), total);
    }

    private async Task<ReportQueryResult> SalesConsignmentRegister(ReportQueryContext ctx, CancellationToken ct)
    {
        var q = ctx.DeliveryOrders().Include(d => d.Customer)
            .Where(d => d.Notes != null && d.Notes.Contains("consignment", StringComparison.OrdinalIgnoreCase));
        return await ctx.PageAsync(q, d => ReportQueryContext.Row(
            ("doNumber", d.Number), ("deliveredAt", d.DeliveredAt), ("customerCode", d.Customer!.Code),
            ("notes", d.Notes)), ct);
    }

    private async Task<ReportQueryResult> SalesInvoiceRegister(ReportQueryContext ctx, CancellationToken ct) =>
        await SalesSummary(ctx, ct);

    private async Task<ReportQueryResult> SalesDoRegister(ReportQueryContext ctx, CancellationToken ct)
    {
        var q = ctx.DeliveryOrders().Include(d => d.Customer).OrderByDescending(d => d.DeliveredAt);
        return await ctx.PageAsync(q, d => ReportQueryContext.Row(
            ("doNumber", d.Number), ("deliveredAt", d.DeliveredAt), ("customerCode", d.Customer!.Code),
            ("status", d.Status.ToString())), ct);
    }

    private async Task<ReportQueryResult> SalesSoRegister(ReportQueryContext ctx, CancellationToken ct) =>
        await SalesOrderCard(ctx, ct);

    private async Task<ReportQueryResult> SalesByBrand(ReportQueryContext ctx, CancellationToken ct) =>
        await SalesRecapByBrand(ctx, ct);

    private async Task<ReportQueryResult> SalesBySalesman(ReportQueryContext ctx, CancellationToken ct) =>
        await SalesRecapBySalesman(ctx, ct);

    private async Task<ReportQueryResult> SalesByArea(ReportQueryContext ctx, CancellationToken ct)
    {
        var q = from i in ctx.Invoices()
                join c in ctx.Db.Customers.AsNoTracking() on i.CustomerId equals c.Id
                group i by c.AreaCode into g
                select new { AreaCode = g.Key ?? "", Amount = g.Sum(x => x.GrandTotal), Count = g.Count() };
        return await ctx.PageAsync(q.OrderByDescending(x => x.Amount), x => ReportQueryContext.Row(
            ("areaCode", x.AreaCode), ("invoiceCount", x.Count), ("amount", x.Amount)), ct);
    }

    private async Task<ReportQueryResult> SalesByCustomer(ReportQueryContext ctx, CancellationToken ct) =>
        await SalesRecapByCustomer(ctx, ct);

    private async Task<ReportQueryResult> SalesCustomerStatement(ReportQueryContext ctx, CancellationToken ct)
    {
        var q = ctx.Invoices();
        if (ctx.CustomerId.HasValue) q = q.Where(i => i.CustomerId == ctx.CustomerId);
        q = q.Include(i => i.Customer).OrderBy(i => i.IssueDate);
        return await ctx.PageAsync(q, i => ReportQueryContext.Row(
            ("invoiceNumber", i.Number), ("issueDate", i.IssueDate), ("dueDate", i.DueDate),
            ("grandTotal", i.GrandTotal), ("amountPaid", i.AmountPaid), ("amountDue", i.AmountDue)), ct);
    }

    private async Task<ReportQueryResult> SalesSalesmanTarget(ReportQueryContext ctx, CancellationToken ct) =>
        await SalesRecapBySalesman(ctx, ct);

    private async Task<ReportQueryResult> SalesTopCustomers(ReportQueryContext ctx, CancellationToken ct) =>
        await SalesRecapByCustomer(ctx, ct);

    private async Task<ReportQueryResult> SalesTopProducts(ReportQueryContext ctx, CancellationToken ct) =>
        await SalesProductSelling(ctx, ct);

    private async Task<ReportQueryResult> SalesPendingDelivery(ReportQueryContext ctx, CancellationToken ct) =>
        await SalesBackOrder(ctx, ct);

    private async Task<ReportQueryResult> SalesCancelledOrders(ReportQueryContext ctx, CancellationToken ct)
    {
        var q = ctx.ApplyDivision(ctx.Db.SalesOrders.AsNoTracking().Where(s => !s.IsDeleted && s.Status == DocumentStatus.Voided), s => s.Division);
        return await ctx.PageAsync(q.Include(s => s.Customer).OrderByDescending(s => s.OrderDate), s =>
            ReportQueryContext.Row(("orderNumber", s.Number), ("orderDate", s.OrderDate),
                ("customerCode", s.Customer!.Code), ("status", s.Status.ToString())), ct);
    }

    private async Task<ReportQueryResult> SalesComparison(ReportQueryContext ctx, CancellationToken ct)
    {
        var current = await ctx.Invoices().SumAsync(i => (decimal?)i.GrandTotal, ct) ?? 0m;
        var priorFrom = ctx.From?.AddYears(-1);
        var priorTo = ctx.To?.AddYears(-1);
        var priorQ = ctx.Db.Invoices.AsNoTracking().Where(i => !i.IsDeleted && i.Status != InvoiceStatus.Voided);
        if (ctx.Division is not null) priorQ = priorQ.Where(i => i.Division == ctx.Division);
        if (priorFrom.HasValue) priorQ = priorQ.Where(i => i.IssueDate >= priorFrom);
        if (priorTo.HasValue) priorQ = priorQ.Where(i => i.IssueDate <= priorTo);
        var prior = await priorQ.SumAsync(i => (decimal?)i.GrandTotal, ct) ?? 0m;
        return ctx.Result([
            ReportQueryContext.Row(("period", "current"), ("amount", current)),
            ReportQueryContext.Row(("period", "priorYear"), ("amount", prior)),
            ReportQueryContext.Row(("period", "variance"), ("amount", current - prior)),
        ], 3);
    }
}

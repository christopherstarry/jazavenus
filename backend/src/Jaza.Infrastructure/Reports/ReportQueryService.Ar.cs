using Jaza.Application.Reports;
using Jaza.Domain.Ar;
using Jaza.Domain.Common;
using Jaza.Domain.Invoicing;
using Microsoft.EntityFrameworkCore;

namespace Jaza.Infrastructure.Reports;

public sealed partial class ReportQueryService
{
    private async Task<ReportQueryResult> ExecuteArAsync(ReportQueryContext ctx, string key, CancellationToken ct) =>
        key switch
        {
            "collection" => await ArCollection(ctx, ct),
            "outstanding-invoice" => await ArOutstandingInvoice(ctx, ct),
            "receipt-report" => await ArReceiptReport(ctx, ct),
            "doar" => await ArDoar(ctx, ct),
            "aging" => await ArAging(ctx, ct),
            "giro-due" => await ArGiroDue(ctx, ct),
            "credit-adjustment" => await ArCreditAdjustment(ctx, ct),
            "ar-confirmation" => await ArConfirmation(ctx, ct),
            "outstanding-pdc" => await ArOutstandingPdc(ctx, ct),
            "payment-allocation" => await ArPaymentAllocation(ctx, ct),
            "customer-balance" => await ArCustomerBalance(ctx, ct),
            "invoice-aging-detail" => await ArInvoiceAgingDetail(ctx, ct),
            "collector-performance" => await ArCollectorPerformance(ctx, ct),
            "cheque-register" => await ArChequeRegister(ctx, ct),
            "credit-memo-register" => await ArCreditMemoRegister(ctx, ct),
            "ar-cross-check" => await ArCrossCheck(ctx, ct),
            "payment-register" => await ArPaymentRegister(ctx, ct),
            "overdue-summary" => await ArOverdueSummary(ctx, ct),
            "customer-ledger" => await ArCustomerLedger(ctx, ct),
            "write-off-register" => await ArWriteOffRegister(ctx, ct),
            "pdc-clearance" => await ArPdcClearance(ctx, ct),
            "ar-period-close" => await ArPeriodClose(ctx, ct),
            "receipt-allocation" => await ArReceiptAllocation(ctx, ct),
            _ => throw new DomainException($"Unknown AR report: {key}"),
        };

    private IQueryable<Payment> Payments(ReportQueryContext ctx)
    {
        var q = ctx.Db.Payments.AsNoTracking().Where(p => !p.IsDeleted);
        q = ctx.ApplyDivision(q, p => p.Division);
        if (ctx.From.HasValue) q = q.Where(p => p.ReceivedAt >= ctx.From);
        if (ctx.To.HasValue) q = q.Where(p => p.ReceivedAt <= ctx.To);
        if (ctx.CustomerId.HasValue) q = q.Where(p => p.CustomerId == ctx.CustomerId);
        return q;
    }

    private async Task<ReportQueryResult> ArCollection(ReportQueryContext ctx, CancellationToken ct)
    {
        var q = Payments(ctx).Include(p => p.Customer)
            .GroupBy(p => p.ReceivedAt.Date)
            .Select(g => new { Date = g.Key, Count = g.Count(), Amount = g.Sum(x => x.Amount) })
            .OrderBy(x => x.Date);
        var list = await q.ToListAsync(ct);
        return ctx.Result(list.Select(x => ReportQueryContext.Row(
            ("date", x.Date), ("receiptCount", x.Count), ("amount", x.Amount))).ToList(), list.Count);
    }

    private async Task<ReportQueryResult> ArOutstandingInvoice(ReportQueryContext ctx, CancellationToken ct)
    {
        var q = ctx.Invoices().Where(i => i.AmountDue > 0)
            .Include(i => i.Customer).OrderBy(i => i.DueDate);
        return await ctx.PageAsync(q, i => ReportQueryContext.Row(
            ("invoiceNumber", i.Number), ("issueDate", i.IssueDate), ("dueDate", i.DueDate),
            ("customerCode", i.Customer!.Code), ("grandTotal", i.GrandTotal),
            ("amountPaid", i.AmountPaid), ("amountDue", i.AmountDue)), ct);
    }

    private async Task<ReportQueryResult> ArReceiptReport(ReportQueryContext ctx, CancellationToken ct)
    {
        var q = Payments(ctx).Include(p => p.Customer).OrderByDescending(p => p.ReceivedAt);
        return await ctx.PageAsync(q, p => ReportQueryContext.Row(
            ("receivedAt", p.ReceivedAt), ("customerCode", p.Customer!.Code),
            ("method", p.Method.ToString()), ("amount", p.Amount), ("reference", p.Reference)), ct);
    }

    private async Task<ReportQueryResult> ArDoar(ReportQueryContext ctx, CancellationToken ct)
    {
        var invoicedDos = ctx.Db.Invoices.AsNoTracking()
            .Where(i => i.DeliveryOrderId != null && !i.IsDeleted)
            .Select(i => i.DeliveryOrderId!.Value);
        var q = ctx.DeliveryOrders().Where(d => !invoicedDos.Contains(d.Id))
            .Include(d => d.Customer).OrderBy(d => d.DeliveredAt);
        return await ctx.PageAsync(q, d => ReportQueryContext.Row(
            ("doNumber", d.Number), ("deliveredAt", d.DeliveredAt), ("customerCode", d.Customer!.Code),
            ("status", d.Status.ToString())), ct);
    }

    private async Task<ReportQueryResult> ArAging(ReportQueryContext ctx, CancellationToken ct)
    {
        var today = DateTime.UtcNow.Date;
        var list = await ctx.Invoices().Where(i => i.AmountDue > 0)
            .Select(i => new { i.Number, i.DueDate, i.AmountDue }).ToListAsync(ct);
        var buckets = list.GroupBy(x => (today - x.DueDate.Date).Days switch
        {
            < 0 => "NotDue",
            <= 30 => "0-30",
            <= 60 => "31-60",
            <= 90 => "61-90",
            _ => "90+",
        }).Select(g => new { Bucket = g.Key, Count = g.Count(), Amount = g.Sum(x => x.AmountDue) }).ToList();
        return ctx.Result(buckets.Select(x => ReportQueryContext.Row(
            ("agingBucket", x.Bucket), ("invoiceCount", x.Count), ("amountDue", x.Amount))).ToList(), buckets.Count);
    }

    private async Task<ReportQueryResult> ArGiroDue(ReportQueryContext ctx, CancellationToken ct)
    {
        var q = ctx.ApplyDivision(ctx.Db.PostDatedChecks.AsNoTracking().Where(p => !p.IsDeleted && p.Status == PdcStatus.Outstanding), p => p.Division);
        if (ctx.From.HasValue) q = q.Where(p => p.ChequeDate >= ctx.From);
        if (ctx.To.HasValue) q = q.Where(p => p.ChequeDate <= ctx.To);
        if (ctx.CustomerId.HasValue) q = q.Where(p => p.CustomerId == ctx.CustomerId);
        q = q.Include(p => p.Customer).OrderBy(p => p.ChequeDate);
        return await ctx.PageAsync(q, p => ReportQueryContext.Row(
            ("chequeNumber", p.Number), ("chequeDate", p.ChequeDate), ("customerCode", p.Customer!.Code),
            ("amount", p.Amount), ("status", p.Status.ToString())), ct);
    }

    private async Task<ReportQueryResult> ArCreditAdjustment(ReportQueryContext ctx, CancellationToken ct)
    {
        var q = ctx.ApplyDivision(ctx.Db.ArAdjustments.AsNoTracking().Where(a => !a.IsDeleted), a => a.Division);
        if (ctx.From.HasValue) q = q.Where(a => a.AdjustmentDate >= ctx.From);
        if (ctx.To.HasValue) q = q.Where(a => a.AdjustmentDate <= ctx.To);
        if (ctx.CustomerId.HasValue) q = q.Where(a => a.CustomerId == ctx.CustomerId);
        q = q.Include(a => a.Customer).OrderByDescending(a => a.AdjustmentDate);
        return await ctx.PageAsync(q, a => ReportQueryContext.Row(
            ("adjustmentNumber", a.Number), ("adjustmentDate", a.AdjustmentDate),
            ("customerCode", a.Customer!.Code), ("amount", a.Amount), ("reasonCode", a.ReasonCode)), ct);
    }

    private async Task<ReportQueryResult> ArConfirmation(ReportQueryContext ctx, CancellationToken ct)
    {
        var q = ctx.Invoices().Where(i => i.Status == InvoiceStatus.Posted || i.Status == InvoiceStatus.PartiallyPaid)
            .Include(i => i.Customer).OrderBy(i => i.Customer!.Code).ThenBy(i => i.IssueDate);
        return await ctx.PageAsync(q, i => ReportQueryContext.Row(
            ("customerCode", i.Customer!.Code), ("invoiceNumber", i.Number), ("issueDate", i.IssueDate),
            ("grandTotal", i.GrandTotal), ("amountDue", i.AmountDue)), ct);
    }

    private async Task<ReportQueryResult> ArOutstandingPdc(ReportQueryContext ctx, CancellationToken ct) =>
        await ArGiroDue(ctx, ct);

    private async Task<ReportQueryResult> ArPaymentAllocation(ReportQueryContext ctx, CancellationToken ct)
    {
        var q = from a in ctx.Db.PaymentAllocations.AsNoTracking()
                join p in Payments(ctx) on a.PaymentId equals p.Id
                join i in ctx.Db.Invoices.AsNoTracking() on a.InvoiceId equals i.Id
                where !a.IsDeleted
                orderby a.AllocatedAt descending
                select new { a.AllocatedAt, p.Reference, i.Number, a.Amount };
        var total = await q.CountAsync(ct);
        var rows = await q.Skip(ctx.Skip).Take(ctx.PageSize).ToListAsync(ct);
        return ctx.Result(rows.Select(x => ReportQueryContext.Row(
            ("allocatedAt", x.AllocatedAt), ("paymentReference", x.Reference),
            ("invoiceNumber", x.Number), ("amount", x.Amount))).ToList(), total);
    }

    private async Task<ReportQueryResult> ArCustomerBalance(ReportQueryContext ctx, CancellationToken ct)
    {
        var q = ctx.Invoices().GroupBy(i => new { i.CustomerId, i.Customer!.Code, i.Customer.Name })
            .Select(g => new
            {
                g.Key.CustomerId, g.Key.Code, g.Key.Name,
                InvoiceCount = g.Count(), TotalDue = g.Sum(x => x.AmountDue),
            }).Where(x => x.TotalDue > 0).OrderByDescending(x => x.TotalDue);
        return await ctx.PageAsync(q, x => ReportQueryContext.Row(
            ("customerCode", x.Code), ("customerName", x.Name), ("invoiceCount", x.InvoiceCount),
            ("totalDue", x.TotalDue)), ct);
    }

    private async Task<ReportQueryResult> ArInvoiceAgingDetail(ReportQueryContext ctx, CancellationToken ct)
    {
        var today = DateTime.UtcNow.Date;
        var q = ctx.Invoices().Where(i => i.AmountDue > 0).Include(i => i.Customer);
        var list = await q.ToListAsync(ct);
        var ordered = list.OrderByDescending(i => (today - i.DueDate.Date).Days).ToList();
        var page = ordered.Skip(ctx.Skip).Take(ctx.PageSize).ToList();
        return ctx.Result(page.Select(i => ReportQueryContext.Row(
            ("invoiceNumber", i.Number), ("customerCode", i.Customer!.Code), ("dueDate", i.DueDate),
            ("daysOverdue", (today - i.DueDate.Date).Days), ("amountDue", i.AmountDue))).ToList(), ordered.Count);
    }

    private async Task<ReportQueryResult> ArCollectorPerformance(ReportQueryContext ctx, CancellationToken ct)
    {
        var q = from p in Payments(ctx)
                join c in ctx.Db.Customers.AsNoTracking() on p.CustomerId equals c.Id into cust
                from c in cust.DefaultIfEmpty()
                group p by c != null ? c.CollectorCode : "" into g
                select new { CollectorCode = g.Key ?? "", ReceiptCount = g.Count(), Amount = g.Sum(x => x.Amount) };
        return await ctx.PageAsync(q.OrderByDescending(x => x.Amount), x => ReportQueryContext.Row(
            ("collectorCode", x.CollectorCode), ("receiptCount", x.ReceiptCount), ("amount", x.Amount)), ct);
    }

    private async Task<ReportQueryResult> ArChequeRegister(ReportQueryContext ctx, CancellationToken ct)
    {
        var q = ctx.ApplyDivision(ctx.Db.PostDatedChecks.AsNoTracking().Where(p => !p.IsDeleted), p => p.Division);
        q = q.Include(p => p.Customer).OrderByDescending(p => p.ReceivedAt);
        return await ctx.PageAsync(q, p => ReportQueryContext.Row(
            ("chequeNumber", p.Number), ("receivedAt", p.ReceivedAt), ("chequeDate", p.ChequeDate),
            ("customerCode", p.Customer!.Code), ("amount", p.Amount), ("status", p.Status.ToString())), ct);
    }

    private async Task<ReportQueryResult> ArCreditMemoRegister(ReportQueryContext ctx, CancellationToken ct)
    {
        var q = ctx.ApplyDivision(ctx.Db.CreditMemos.AsNoTracking().Where(c => !c.IsDeleted), c => c.Division);
        if (ctx.From.HasValue) q = q.Where(c => c.IssueDate >= ctx.From);
        if (ctx.To.HasValue) q = q.Where(c => c.IssueDate <= ctx.To);
        if (ctx.CustomerId.HasValue) q = q.Where(c => c.CustomerId == ctx.CustomerId);
        q = q.Include(c => c.Customer).OrderByDescending(c => c.IssueDate);
        return await ctx.PageAsync(q, c => ReportQueryContext.Row(
            ("memoNumber", c.Number), ("issueDate", c.IssueDate), ("customerCode", c.Customer!.Code),
            ("status", c.Status.ToString()), ("lineCount", c.Lines.Count)), ct);
    }

    private async Task<ReportQueryResult> ArCrossCheck(ReportQueryContext ctx, CancellationToken ct)
    {
        var invoiceTotal = await ctx.Invoices().SumAsync(i => (decimal?)i.GrandTotal, ct) ?? 0m;
        var paidTotal = await Payments(ctx).SumAsync(p => (decimal?)p.Amount, ct) ?? 0m;
        var dueTotal = await ctx.Invoices().SumAsync(i => (decimal?)i.AmountDue, ct) ?? 0m;
        return ctx.Result([
            ReportQueryContext.Row(("metric", "invoiceTotal"), ("amount", invoiceTotal)),
            ReportQueryContext.Row(("metric", "paymentsTotal"), ("amount", paidTotal)),
            ReportQueryContext.Row(("metric", "outstandingDue"), ("amount", dueTotal)),
        ], 3);
    }

    private async Task<ReportQueryResult> ArPaymentRegister(ReportQueryContext ctx, CancellationToken ct) =>
        await ArReceiptReport(ctx, ct);

    private async Task<ReportQueryResult> ArOverdueSummary(ReportQueryContext ctx, CancellationToken ct)
    {
        var today = DateTime.UtcNow.Date;
        var q = ctx.Invoices().Where(i => i.AmountDue > 0 && i.DueDate < today)
            .GroupBy(i => i.Division)
            .Select(g => new { Division = g.Key, Count = g.Count(), Amount = g.Sum(x => x.AmountDue) });
        var list = await q.ToListAsync(ct);
        return ctx.Result(list.Select(x => ReportQueryContext.Row(
            ("division", x.Division), ("invoiceCount", x.Count), ("overdueAmount", x.Amount))).ToList(), list.Count);
    }

    private async Task<ReportQueryResult> ArCustomerLedger(ReportQueryContext ctx, CancellationToken ct)
    {
        var invoices = ctx.Invoices();
        if (ctx.CustomerId.HasValue) invoices = invoices.Where(i => i.CustomerId == ctx.CustomerId);
        var invRows = await invoices.Select(i => new { i.IssueDate, Type = "Invoice", i.Number, Debit = i.GrandTotal, Credit = 0m }).ToListAsync(ct);
        var payQ = Payments(ctx);
        if (ctx.CustomerId.HasValue) payQ = payQ.Where(p => p.CustomerId == ctx.CustomerId);
        var payRows = await payQ.Select(p => new { Date = p.ReceivedAt, Type = "Payment", Number = p.Reference ?? "", Debit = 0m, Credit = p.Amount }).ToListAsync(ct);
        var combined = invRows.Select(x => ReportQueryContext.Row(
                ("date", x.IssueDate), ("type", x.Type), ("reference", x.Number),
                ("debit", x.Debit), ("credit", x.Credit)))
            .Concat(payRows.Select(x => ReportQueryContext.Row(
                ("date", x.Date), ("type", x.Type), ("reference", x.Number),
                ("debit", x.Debit), ("credit", x.Credit))))
            .OrderBy(r => r.Columns["date"]).ToList();
        return ctx.Result(combined.Skip(ctx.Skip).Take(ctx.PageSize).ToList(), combined.Count);
    }

    private async Task<ReportQueryResult> ArWriteOffRegister(ReportQueryContext ctx, CancellationToken ct)
    {
        var q = ctx.ApplyDivision(ctx.Db.ArAdjustments.AsNoTracking()
            .Where(a => !a.IsDeleted && a.Amount < 0), a => a.Division);
        q = q.Include(a => a.Customer).OrderByDescending(a => a.AdjustmentDate);
        return await ctx.PageAsync(q, a => ReportQueryContext.Row(
            ("adjustmentNumber", a.Number), ("adjustmentDate", a.AdjustmentDate),
            ("customerCode", a.Customer!.Code), ("amount", a.Amount)), ct);
    }

    private async Task<ReportQueryResult> ArPdcClearance(ReportQueryContext ctx, CancellationToken ct)
    {
        var q = from h in ctx.Db.PdcClearanceHistories.AsNoTracking()
                join p in ctx.Db.PostDatedChecks.AsNoTracking() on h.PostDatedCheckId equals p.Id
                orderby h.OccurredAtUtc descending
                select new { p.Number, h.FromStatus, h.ToStatus, h.OccurredAtUtc, p.Amount };
        return await ctx.PageAsync(q, x => ReportQueryContext.Row(
            ("chequeNumber", x.Number), ("fromStatus", x.FromStatus.ToString()),
            ("toStatus", x.ToStatus.ToString()), ("occurredAt", x.OccurredAtUtc), ("amount", x.Amount)), ct);
    }

    private async Task<ReportQueryResult> ArPeriodClose(ReportQueryContext ctx, CancellationToken ct)
    {
        var q = ctx.ApplyDivision(ctx.Db.ArPeriodClosings.AsNoTracking(), c => c.Division)
            .OrderByDescending(c => c.Year).ThenByDescending(c => c.Month);
        return await ctx.PageAsync(q, c => ReportQueryContext.Row(
            ("year", c.Year), ("month", c.Month), ("closedAt", c.ClosedAtUtc),
            ("closedByUserId", c.ClosedByUserId)), ct);
    }

    private async Task<ReportQueryResult> ArReceiptAllocation(ReportQueryContext ctx, CancellationToken ct) =>
        await ArPaymentAllocation(ctx, ct);
}

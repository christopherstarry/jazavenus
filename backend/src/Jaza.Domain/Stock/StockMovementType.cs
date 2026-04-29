namespace Jaza.Domain.Stock;

public enum StockMovementType
{
    GoodsReceipt = 1,        // IN  — from supplier (GRN)
    GoodsIssue = 2,          // OUT — to customer (DO)
    AdjustmentIn = 3,        // IN  — manual correction up
    AdjustmentOut = 4,       // OUT — manual correction down
    TransferIn = 5,          // IN  — internal transfer destination
    TransferOut = 6,         // OUT — internal transfer source
    StockTakeIn = 7,         // IN  — opening / count surplus
    StockTakeOut = 8,        // OUT — count shortage
    Reversal = 99,           // Reverses an earlier movement (sign flips)
}

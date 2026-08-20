// Money + number formatting.
//
// IMPORTANT: prices are stored as plain numbers in the database and are
// rendered here with Indian digit grouping (₹1,24,999). No exchange rate is
// applied — inventing one would silently disagree with real order totals.
// Switching the catalogue to true INR is a backend data migration.

const INR = new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
});

const INR_PAISE = new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
});

/** `₹1,24,999` — whole rupees unless the amount has a fractional part. */
export function formatPrice(value) {
    const n = Number(value);
    if (!Number.isFinite(n)) return '₹0';
    return `₹${Number.isInteger(n) ? INR.format(n) : INR_PAISE.format(n)}`;
}

/** Grouped number without the currency symbol, e.g. `2,104` review counts. */
export function formatCount(value) {
    const n = Number(value);
    if (!Number.isFinite(n)) return '0';
    return INR.format(n);
}

/**
 * Discount info, or `null` when the catalogue has no MRP for this product.
 *
 * The Product model has no `mrp`/`discountPercent` column, so most items will
 * return null and the UI simply omits the strikethrough. We never synthesise a
 * fake "was" price to manufacture urgency.
 */
export function getDiscount(product) {
    const price = Number(product?.price);
    const mrp = Number(product?.mrp ?? product?.originalPrice);
    if (!Number.isFinite(price) || !Number.isFinite(mrp) || mrp <= price) return null;
    return {
        mrp,
        amountOff: mrp - price,
        percentOff: Math.round(((mrp - price) / mrp) * 100),
    };
}

/** "Only 3 left" / "In stock" urgency copy derived from real stock counts. */
export function getStockState(stock) {
    if (stock == null) return { level: 'unknown', label: null };
    if (stock <= 0) return { level: 'out', label: 'Out of stock' };
    if (stock <= 5) return { level: 'low', label: `Only ${stock} left` };
    return { level: 'in', label: 'In stock' };
}

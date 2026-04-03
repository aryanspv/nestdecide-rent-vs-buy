/** Format number in Indian currency format: ₹12,45,000 */
export function formatINR(amount: number, compact = false): string {
  if (compact) {
    const abs = Math.abs(amount);
    if (abs >= 1e7) return `₹${(amount / 1e7).toFixed(1)}Cr`;
    if (abs >= 1e5) return `₹${(amount / 1e5).toFixed(1)}L`;
    if (abs >= 1e3) return `₹${(amount / 1e3).toFixed(0)}K`;
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatLakhs(amount: number): string {
  const lakhs = amount / 1e5;
  if (lakhs >= 100) return `₹${(lakhs / 100).toFixed(1)} Cr`;
  return `₹${lakhs.toFixed(1)} L`;
}

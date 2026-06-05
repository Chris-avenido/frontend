export const formatCurrency = (amount) => {
    if (!amount) return 'PHP 0.00';
    return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(amount);
};

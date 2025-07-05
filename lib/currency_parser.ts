// FormattedCurrency component
// This component takes an amount and an optional currency code,
// then formats the number with appropriate thousands separators
// and currency symbol using Intl.NumberFormat.
const formattedCurrency = ( amount : string | number , currency = 'NGN' ) => {
    // Ensure the amount is a number. If it's not, default to 0 or handle as an error.
    const numericAmount = typeof amount === 'number' ? amount : parseFloat(amount);
  
    const formattedValue = new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2, // Ensure at least two decimal places for currency
        maximumFractionDigits: 2, // Ensure no more than two decimal places
      }).format(numericAmount);
  
    return formattedValue;
  };

  export default formattedCurrency;
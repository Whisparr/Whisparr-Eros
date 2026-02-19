function formatNumber(input: string | number, minimumFractionDigits = 0) {
  const size = Number(input);

  if (isNaN(size)) {
    return '';
  }

  // Use the user's locale for formatting
  const userLocale =
    (navigator.languages && navigator.languages[0]) ||
    navigator.language ||
    'en';

  // Format the number with the specified minimum fraction digits
  const formattedNumber = size.toLocaleString(userLocale, {
    minimumFractionDigits,
  });
  return formattedNumber;
}

export default formatNumber;

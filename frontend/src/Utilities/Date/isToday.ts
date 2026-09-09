function isToday(date?: string | Date | null) {
  if (!date) {
    return false;
  }

  const dateObj = date instanceof Date ? date : new Date(date);
  const today = new Date();

  return (
    dateObj.getDate() === today.getDate() &&
    dateObj.getMonth() === today.getMonth() &&
    dateObj.getFullYear() === today.getFullYear()
  );
}

export default isToday;

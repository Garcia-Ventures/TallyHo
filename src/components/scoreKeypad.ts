export function applyKeypadDigit(current: string, key: string, maxLength = 5): string {
  if (key === 'DEL') {
    return current.slice(0, -1);
  }
  if (key === 'CLR') {
    return '';
  }
  if (current.length >= maxLength) {
    return current;
  }
  return current + key;
}

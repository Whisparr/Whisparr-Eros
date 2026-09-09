export default function isString(possibleString: unknown): boolean {
  return typeof possibleString === 'string' || possibleString instanceof String;
}

const ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const PREFIX = 'GX-APP-';
const LENGTH = 6;

export function generateReferenceNumber(): string {
  let result = '';
  const bytes = new Uint8Array(LENGTH);
  crypto.getRandomValues(bytes);
  for (let i = 0; i < LENGTH; i++) {
    result += ALPHABET[bytes[i] % ALPHABET.length];
  }
  return `${PREFIX}${result}`;
}

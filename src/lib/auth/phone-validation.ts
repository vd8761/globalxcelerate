const E164_REGEX = /^\+[1-9]\d{1,14}$/;

interface PhoneValidationResult {
  isValid: boolean;
  e164Format: string;
  error?: string;
}

export function validatePhoneNumber(
  phone: string,
  countryCode?: string
): PhoneValidationResult {
  // Strip spaces, dashes, parentheses
  const cleaned = phone.replace(/[\s\-().]/g, '');

  // Build E.164 format
  let e164: string;
  if (cleaned.startsWith('+')) {
    e164 = cleaned;
  } else if (countryCode) {
    const code = countryCode.startsWith('+') ? countryCode : `+${countryCode}`;
    e164 = `${code}${cleaned}`;
  } else {
    e164 = `+${cleaned}`;
  }

  if (!E164_REGEX.test(e164)) {
    return {
      isValid: false,
      e164Format: '',
      error: 'Please enter a valid phone number in international format.',
    };
  }

  return {
    isValid: true,
    e164Format: e164,
  };
}

export function maskPhoneNumber(phone: string): string {
  if (!phone || phone.length < 6) return phone;
  const visible = phone.slice(0, 4);
  const last4 = phone.slice(-4);
  const masked = '*'.repeat(Math.max(0, phone.length - 8));
  return `${visible}${masked}${last4}`;
}

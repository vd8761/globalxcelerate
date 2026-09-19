'use client';

import { useState } from 'react';
import { OtpPhoneForm } from './otp-phone-form';
import { OtpVerifyForm } from './otp-verify-form';

export function OtpPageContent() {
  const [step, setStep] = useState<'phone' | 'verify'>('phone');
  const [phone, setPhone] = useState('');
  const [maskedPhone, setMaskedPhone] = useState('');

  const handleCodeSent = (fullPhone: string, masked: string) => {
    setPhone(fullPhone);
    setMaskedPhone(masked);
    setStep('verify');
  };

  const handleBack = () => {
    setStep('phone');
  };

  if (step === 'verify') {
    return (
      <OtpVerifyForm
        phone={phone}
        maskedPhone={maskedPhone}
        onBack={handleBack}
      />
    );
  }

  return <OtpPhoneForm onCodeSent={handleCodeSent} />;
}

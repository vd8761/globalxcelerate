'use client';

import { useCallback, useState } from 'react';
import { getSchemaForStep } from '@/lib/onboarding/validation-schemas';

export function useStepValidation(stepName: string) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isValid, setIsValid] = useState(true);

  const validate = useCallback((data: unknown) => {
    const schema = getSchemaForStep(stepName);
    if (!schema) {
      setIsValid(true);
      setErrors({});
      return { success: true, data };
    }

    const result = schema.safeParse(data);
    if (result.success) {
      setIsValid(true);
      setErrors({});
      return { success: true, data: result.data };
    }

    const fieldErrors: Record<string, string> = {};
    for (const issue of result.error.issues) {
      const path = issue.path.join('.');
      if (!fieldErrors[path]) {
        fieldErrors[path] = issue.message;
      }
    }
    setErrors(fieldErrors);
    setIsValid(false);
    return { success: false, errors: fieldErrors };
  }, [stepName]);

  const clearErrors = useCallback(() => {
    setErrors({});
    setIsValid(true);
  }, []);

  return { validate, errors, clearErrors, isValid };
}


import { useSupabaseConfig } from './useSupabaseConfig';

export const useValidation = () => {
  const { validationRules } = useSupabaseConfig();

  const validateField = (fieldName: string, value: string) => {
    const rules = validationRules.filter(rule => rule.field_name === fieldName);
    const errors: string[] = [];

    for (const rule of rules) {
      switch (rule.rule_type) {
        case 'required':
          if (!value || value.trim() === '') {
            errors.push(rule.error_message);
          }
          break;
        case 'email':
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (value && !emailRegex.test(value)) {
            errors.push(rule.error_message);
          }
          break;
        case 'min_length':
          const minLength = parseInt(rule.rule_value || '0');
          if (value && value.length < minLength) {
            errors.push(rule.error_message);
          }
          break;
        case 'max_length':
          const maxLength = parseInt(rule.rule_value || '0');
          if (value && value.length > maxLength) {
            errors.push(rule.error_message);
          }
          break;
        case 'regex':
          if (rule.rule_value && value) {
            const regex = new RegExp(rule.rule_value);
            if (!regex.test(value)) {
              errors.push(rule.error_message);
            }
          }
          break;
      }
    }

    return errors;
  };

  const validateForm = (formData: Record<string, string>) => {
    const allErrors: Record<string, string[]> = {};
    
    Object.keys(formData).forEach(fieldName => {
      const errors = validateField(fieldName, formData[fieldName]);
      if (errors.length > 0) {
        allErrors[fieldName] = errors;
      }
    });

    return {
      isValid: Object.keys(allErrors).length === 0,
      errors: allErrors
    };
  };

  return {
    validateField,
    validateForm
  };
};

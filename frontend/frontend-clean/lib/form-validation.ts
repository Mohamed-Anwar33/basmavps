import { FormField, FormSchema } from '@/components/admin/structured-form-builder';

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

export class FormValidator {
  static validateField(field: FormField, value: any): ValidationError | null {
    // Required field validation
    if (field.required && (value === null || value === undefined || value === '')) {
      return {
        field: field.key,
        message: `${field.label.ar} مطلوب`
      };
    }

    // Skip validation if field is empty and not required
    if (!field.required && (value === null || value === undefined || value === '')) {
      return null;
    }

    // Type-specific validation
    switch (field.type) {
      case 'email':
        if (!this.isValidEmail(value)) {
          return {
            field: field.key,
            message: `${field.label.ar} يجب أن يكون بريد إلكتروني صحيح`
          };
        }
        break;

      case 'url':
        if (!this.isValidUrl(value)) {
          return {
            field: field.key,
            message: `${field.label.ar} يجب أن يكون رابط صحيح`
          };
        }
        break;

      case 'tel':
        if (!this.isValidPhone(value)) {
          return {
            field: field.key,
            message: `${field.label.ar} يجب أن يكون رقم هاتف صحيح`
          };
        }
        break;

      case 'number':
        if (isNaN(value)) {
          return {
            field: field.key,
            message: `${field.label.ar} يجب أن يكون رقم صحيح`
          };
        }
        
        // Min/Max validation for numbers
        if (field.validation?.min !== undefined && value < field.validation.min) {
          return {
            field: field.key,
            message: `${field.label.ar} يجب أن يكون أكبر من أو يساوي ${field.validation.min}`
          };
        }
        
        if (field.validation?.max !== undefined && value > field.validation.max) {
          return {
            field: field.key,
            message: `${field.label.ar} يجب أن يكون أصغر من أو يساوي ${field.validation.max}`
          };
        }
        break;

      case 'text':
      case 'textarea':
        // Length validation for text fields
        if (field.validation?.min !== undefined && value.length < field.validation.min) {
          return {
            field: field.key,
            message: `${field.label.ar} يجب أن يحتوي على ${field.validation.min} أحرف على الأقل`
          };
        }
        
        if (field.validation?.max !== undefined && value.length > field.validation.max) {
          return {
            field: field.key,
            message: `${field.label.ar} يجب أن لا يتجاوز ${field.validation.max} حرف`
          };
        }
        
        // Pattern validation
        if (field.validation?.pattern) {
          const regex = new RegExp(field.validation.pattern);
          if (!regex.test(value)) {
            return {
              field: field.key,
              message: field.validation.message || `${field.label.ar} لا يطابق النمط المطلوب`
            };
          }
        }
        break;

      case 'date':
        if (!this.isValidDate(value)) {
          return {
            field: field.key,
            message: `${field.label.ar} يجب أن يكون تاريخ صحيح`
          };
        }
        break;

      case 'multiselect':
        if (Array.isArray(value)) {
          if (field.validation?.min !== undefined && value.length < field.validation.min) {
            return {
              field: field.key,
              message: `${field.label.ar} يجب اختيار ${field.validation.min} عناصر على الأقل`
            };
          }
          
          if (field.validation?.max !== undefined && value.length > field.validation.max) {
            return {
              field: field.key,
              message: `${field.label.ar} يجب أن لا يتجاوز ${field.validation.max} عناصر`
            };
          }
        }
        break;
    }

    return null;
  }

  static validateForm(schema: FormSchema, data: Record<string, any>): ValidationResult {
    const errors: ValidationError[] = [];

    for (const field of schema.fields) {
      // Check conditional visibility
      if (field.conditional && !this.checkConditional(field.conditional, data)) {
        continue; // Skip validation for hidden fields
      }

      const error = this.validateField(field, data[field.key]);
      if (error) {
        errors.push(error);
      }

      // Validate repeater fields
      if (field.type === 'repeater' && field.repeater && data[field.key]) {
        const repeaterData = data[field.key];
        if (Array.isArray(repeaterData)) {
          // Check min/max items
          if (field.repeater.minItems && repeaterData.length < field.repeater.minItems) {
            errors.push({
              field: field.key,
              message: `${field.label.ar} يجب أن يحتوي على ${field.repeater.minItems} عناصر على الأقل`
            });
          }
          
          if (field.repeater.maxItems && repeaterData.length > field.repeater.maxItems) {
            errors.push({
              field: field.key,
              message: `${field.label.ar} يجب أن لا يتجاوز ${field.repeater.maxItems} عناصر`
            });
          }

          // Validate each repeater item
          repeaterData.forEach((item, index) => {
            for (const subField of field.repeater!.fields) {
              const subError = this.validateField(subField, item[subField.key]);
              if (subError) {
                errors.push({
                  field: `${field.key}[${index}].${subField.key}`,
                  message: `${field.label.ar} - العنصر ${index + 1}: ${subError.message}`
                });
              }
            }
          });
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  private static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private static isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  private static isValidPhone(phone: string): boolean {
    // Basic phone validation - can be enhanced based on requirements
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
  }

  private static isValidDate(date: string): boolean {
    const parsedDate = new Date(date);
    return !isNaN(parsedDate.getTime());
  }

  private static checkConditional(
    conditional: NonNullable<FormField['conditional']>,
    data: Record<string, any>
  ): boolean {
    const fieldValue = data[conditional.field];
    
    switch (conditional.operator) {
      case 'equals':
        return fieldValue === conditional.value;
      case 'not_equals':
        return fieldValue !== conditional.value;
      case 'contains':
        return Array.isArray(fieldValue) 
          ? fieldValue.includes(conditional.value)
          : String(fieldValue).includes(String(conditional.value));
      default:
        return true;
    }
  }
}

// Utility function to get field errors for a specific field
export const getFieldErrors = (
  fieldKey: string, 
  errors: ValidationError[]
): ValidationError[] => {
  return errors.filter(error => 
    error.field === fieldKey || error.field.startsWith(`${fieldKey}[`)
  );
};

// Utility function to check if a field has errors
export const hasFieldError = (
  fieldKey: string, 
  errors: ValidationError[]
): boolean => {
  return getFieldErrors(fieldKey, errors).length > 0;
};

export default FormValidator;
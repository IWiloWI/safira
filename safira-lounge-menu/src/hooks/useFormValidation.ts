/**
 * Custom hook for comprehensive form validation with real-time feedback
 * Integrates with the validation utilities for consistent validation across the app
 */

import { useState, useCallback, useEffect, useMemo } from 'react';
import { 
  ValidationResult, 
  FieldValidation, 
  validateField,
  createDebouncedValidator,
  FormValidationError
} from '../utils/validation';

// Form field state
interface FormFieldState {
  value: any;
  errors: string[];
  warnings: string[];
  touched: boolean;
  validating: boolean;
  isValid: boolean;
}

// Form validation configuration
interface FormValidationConfig {
  [fieldName: string]: {
    validation: FieldValidation;
    debounceMs?: number;
    validateOnChange?: boolean;
    validateOnBlur?: boolean;
  };
}

// Form state
interface FormState<T> {
  values: T;
  fields: { [K in keyof T]: FormFieldState };
  isValid: boolean;
  isSubmitting: boolean;
  hasErrors: boolean;
  submitCount: number;
}

// Hook options
interface UseFormValidationOptions<T> {
  initialValues: T;
  validationConfig: FormValidationConfig;
  onSubmit?: (values: T) => Promise<void> | void;
  onValidationChange?: (isValid: boolean, errors: string[]) => void;
  validateOnMount?: boolean;
}

/**
 * Comprehensive form validation hook
 */
export function useFormValidation<T extends Record<string, any>>({
  initialValues,
  validationConfig,
  onSubmit,
  onValidationChange,
  validateOnMount = false
}: UseFormValidationOptions<T>) {
  
  // Initialize form state
  const [formState, setFormState] = useState<FormState<T>>(() => {
    const fields = {} as { [K in keyof T]: FormFieldState };
    
    Object.keys(initialValues).forEach((key) => {
      fields[key as keyof T] = {
        value: initialValues[key as keyof T],
        errors: [],
        warnings: [],
        touched: false,
        validating: false,
        isValid: true
      };
    });

    return {
      values: { ...initialValues },
      fields,
      isValid: true,
      isSubmitting: false,
      hasErrors: false,
      submitCount: 0
    };
  });

  // Create debounced validators
  const debouncedValidators = useMemo(() => {
    const validators: { [key: string]: any } = {};
    
    Object.entries(validationConfig).forEach(([fieldName, config]) => {
      const debounceMs = config.debounceMs ?? 300;
      validators[fieldName] = createDebouncedValidator(
        (value: any) => validateField(value, config.validation, fieldName),
        debounceMs
      );
    });
    
    return validators;
  }, [validationConfig]);

  /**
   * Validate a single field
   */
  const validateSingleField = useCallback((fieldName: keyof T, value: any): ValidationResult => {
    const config = validationConfig[fieldName as string];
    if (!config) {
      return { isValid: true, errors: [] };
    }
    
    return validateField(value, config.validation, fieldName as string);
  }, [validationConfig]);

  /**
   * Validate all fields
   */
  const validateAllFields = useCallback((): ValidationResult => {
    const allErrors: string[] = [];
    const allWarnings: string[] = [];
    let isValid = true;

    Object.keys(formState.values).forEach((fieldName) => {
      const result = validateSingleField(fieldName as keyof T, formState.values[fieldName as keyof T]);
      if (!result.isValid) {
        isValid = false;
        allErrors.push(...result.errors);
      }
      if (result.warnings) {
        allWarnings.push(...result.warnings);
      }
    });

    return {
      isValid,
      errors: allErrors,
      warnings: allWarnings
    };
  }, [formState.values, validateSingleField]);

  /**
   * Update form state helper
   */
  const updateFormState = useCallback((updater: (prev: FormState<T>) => FormState<T>) => {
    setFormState(updater);
  }, []);

  /**
   * Set field value and validate
   */
  const setFieldValue = useCallback((fieldName: keyof T, value: any, validate: boolean = true) => {
    updateFormState(prev => {
      const newState = { ...prev };
      newState.values = { ...prev.values, [fieldName]: value };
      
      if (validate) {
        const config = validationConfig[fieldName as string];
        const shouldValidateOnChange = config?.validateOnChange ?? true;
        
        if (shouldValidateOnChange) {
          // Mark field as validating
          newState.fields = {
            ...prev.fields,
            [fieldName]: {
              ...prev.fields[fieldName],
              value,
              validating: true
            }
          };

          // Use debounced validator
          const validator = debouncedValidators[fieldName as string];
          if (validator) {
            validator(value, (result: ValidationResult) => {
              updateFormState(current => ({
                ...current,
                fields: {
                  ...current.fields,
                  [fieldName]: {
                    ...current.fields[fieldName],
                    value,
                    errors: result.errors,
                    warnings: result.warnings || [],
                    isValid: result.isValid,
                    validating: false
                  }
                }
              }));
            });
          }
        } else {
          newState.fields = {
            ...prev.fields,
            [fieldName]: {
              ...prev.fields[fieldName],
              value
            }
          };
        }
      }

      return newState;
    });
  }, [validationConfig, debouncedValidators, updateFormState]);

  /**
   * Set field as touched (for blur events)
   */
  const setFieldTouched = useCallback((fieldName: keyof T, touched: boolean = true) => {
    updateFormState(prev => {
      const newState = { ...prev };
      newState.fields = {
        ...prev.fields,
        [fieldName]: {
          ...prev.fields[fieldName],
          touched
        }
      };

      // Validate on blur if configured
      const config = validationConfig[fieldName as string];
      const shouldValidateOnBlur = config?.validateOnBlur ?? true;
      
      if (touched && shouldValidateOnBlur) {
        const result = validateSingleField(fieldName, prev.values[fieldName]);
        newState.fields[fieldName] = {
          ...newState.fields[fieldName],
          errors: result.errors,
          warnings: result.warnings || [],
          isValid: result.isValid
        };
      }

      return newState;
    });
  }, [validationConfig, validateSingleField, updateFormState]);

  /**
   * Set multiple field values
   */
  const setValues = useCallback((values: Partial<T>) => {
    updateFormState(prev => ({
      ...prev,
      values: { ...prev.values, ...values }
    }));
  }, [updateFormState]);

  /**
   * Reset form to initial values
   */
  const resetForm = useCallback((newInitialValues?: T) => {
    const values = newInitialValues || initialValues;
    const fields = {} as { [K in keyof T]: FormFieldState };
    
    Object.keys(values).forEach((key) => {
      fields[key as keyof T] = {
        value: values[key as keyof T],
        errors: [],
        warnings: [],
        touched: false,
        validating: false,
        isValid: true
      };
    });

    setFormState({
      values,
      fields,
      isValid: true,
      isSubmitting: false,
      hasErrors: false,
      submitCount: 0
    });
  }, [initialValues]);

  /**
   * Handle form submission
   */
  const handleSubmit = useCallback(async (event?: React.FormEvent) => {
    if (event) {
      event.preventDefault();
    }

    updateFormState(prev => ({
      ...prev,
      isSubmitting: true,
      submitCount: prev.submitCount + 1
    }));

    try {
      // Validate all fields before submission
      const validationResult = validateAllFields();
      
      if (!validationResult.isValid) {
        // Mark all fields as touched to show errors
        updateFormState(prev => {
          const newFields = { ...prev.fields };
          Object.keys(newFields).forEach(key => {
            const fieldResult = validateSingleField(key as keyof T, prev.values[key as keyof T]);
            newFields[key as keyof T] = {
              ...newFields[key as keyof T],
              touched: true,
              errors: fieldResult.errors,
              warnings: fieldResult.warnings || [],
              isValid: fieldResult.isValid
            };
          });

          return {
            ...prev,
            fields: newFields,
            isValid: false,
            hasErrors: true,
            isSubmitting: false
          };
        });

        throw new FormValidationError(validationResult, 'Formvalidierung fehlgeschlagen');
      }

      // Call onSubmit if provided
      if (onSubmit) {
        await onSubmit(formState.values);
      }

      updateFormState(prev => ({
        ...prev,
        isSubmitting: false
      }));

    } catch (error) {
      updateFormState(prev => ({
        ...prev,
        isSubmitting: false
      }));
      throw error;
    }
  }, [formState.values, validateAllFields, validateSingleField, onSubmit, updateFormState]);

  /**
   * Get field props for easy integration with input components
   */
  const getFieldProps = useCallback((fieldName: keyof T) => {
    const field = formState.fields[fieldName];
    
    return {
      name: fieldName as string,
      value: field.value,
      onChange: (value: any) => setFieldValue(fieldName, value),
      onBlur: () => setFieldTouched(fieldName, true),
      error: field.touched ? field.errors[0] : undefined,
      errors: field.touched ? field.errors : [],
      warnings: field.warnings,
      isValid: field.isValid,
      isValidating: field.validating,
      touched: field.touched
    };
  }, [formState.fields, setFieldValue, setFieldTouched]);

  /**
   * Get field error helper
   */
  const getFieldError = useCallback((fieldName: keyof T): string | undefined => {
    const field = formState.fields[fieldName];
    return field.touched && field.errors.length > 0 ? field.errors[0] : undefined;
  }, [formState.fields]);

  /**
   * Get field errors helper
   */
  const getFieldErrors = useCallback((fieldName: keyof T): string[] => {
    const field = formState.fields[fieldName];
    return field.touched ? field.errors : [];
  }, [formState.fields]);

  /**
   * Check if field has error
   */
  const hasFieldError = useCallback((fieldName: keyof T): boolean => {
    const field = formState.fields[fieldName];
    return field.touched && field.errors.length > 0;
  }, [formState.fields]);

  // Calculate form validation state
  const isFormValid = useMemo(() => {
    return Object.values(formState.fields).every(field => field.isValid);
  }, [formState.fields]);

  const hasFormErrors = useMemo(() => {
    return Object.values(formState.fields).some(field => field.touched && field.errors.length > 0);
  }, [formState.fields]);

  // Validate on mount if requested
  useEffect(() => {
    if (validateOnMount) {
      const result = validateAllFields();
      if (onValidationChange) {
        onValidationChange(result.isValid, result.errors);
      }
    }
  }, [validateOnMount, validateAllFields, onValidationChange]);

  // Call validation change callback when validation state changes
  useEffect(() => {
    if (onValidationChange) {
      const allErrors = Object.values(formState.fields)
        .filter(field => field.touched)
        .flatMap(field => field.errors);
      
      onValidationChange(isFormValid, allErrors);
    }
  }, [isFormValid, formState.fields, onValidationChange]);

  return {
    // Form state
    values: formState.values,
    fields: formState.fields,
    isValid: isFormValid,
    hasErrors: hasFormErrors,
    isSubmitting: formState.isSubmitting,
    submitCount: formState.submitCount,

    // Actions
    setFieldValue,
    setFieldTouched,
    setValues,
    resetForm,
    handleSubmit,

    // Helpers
    getFieldProps,
    getFieldError,
    getFieldErrors,
    hasFieldError,
    validateField: validateSingleField,
    validateForm: validateAllFields
  };
}
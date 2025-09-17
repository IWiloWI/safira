/**
 * Form validation and input type definitions
 * Provides comprehensive typing for form handling and validation
 */

import { ProductBadges, FlexibleText } from './common.types';
import { UserRole } from './user.types';

/**
 * Form validation error structure
 */
export interface FormError {
  /** Field name that has the error */
  field: string;
  /** Error message */
  message: string;
  /** Error code for internationalization */
  code: string;
  /** Additional error context */
  context?: Record<string, unknown>;
}

/**
 * Form validation result
 */
export interface FormValidationResult {
  /** Whether the form is valid */
  isValid: boolean;
  /** List of validation errors */
  errors: FormError[];
  /** Validated and sanitized data */
  data?: Record<string, unknown>;
}

/**
 * Base form state interface
 */
export interface FormState<T = Record<string, unknown>> {
  /** Form data values */
  values: T;
  /** Form errors by field */
  errors: Record<string, string>;
  /** Fields that have been touched/modified */
  touched: Record<string, boolean>;
  /** Whether form is currently submitting */
  isSubmitting: boolean;
  /** Whether form has been submitted */
  isSubmitted: boolean;
  /** Whether form is valid */
  isValid: boolean;
  /** Whether form has been modified */
  isDirty: boolean;
}

/**
 * Form field configuration
 */
export interface FormField {
  /** Field name/key */
  name: string;
  /** Field label for display */
  label: string;
  /** Field type */
  type: 'text' | 'email' | 'password' | 'number' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'file' | 'date' | 'time';
  /** Placeholder text */
  placeholder?: string;
  /** Default value */
  defaultValue?: unknown;
  /** Whether field is required */
  required?: boolean;
  /** Whether field is disabled */
  disabled?: boolean;
  /** Whether field is read-only */
  readonly?: boolean;
  /** Field validation rules */
  validation?: FieldValidation;
  /** Options for select/radio fields */
  options?: FormOption[];
  /** Help text */
  helpText?: string;
  /** Custom CSS classes */
  className?: string;
  /** Field attributes */
  attributes?: Record<string, unknown>;
}

/**
 * Form option for select/radio fields
 */
export interface FormOption {
  /** Option value */
  value: string | number;
  /** Option label */
  label: string;
  /** Whether option is disabled */
  disabled?: boolean;
  /** Option group */
  group?: string;
}

/**
 * Field validation configuration
 */
export interface FieldValidation {
  /** Minimum length for text fields */
  minLength?: number;
  /** Maximum length for text fields */
  maxLength?: number;
  /** Minimum value for number fields */
  min?: number;
  /** Maximum value for number fields */
  max?: number;
  /** Regular expression pattern */
  pattern?: string;
  /** Custom validation function */
  custom?: (value: unknown, formData: Record<string, unknown>) => string | null;
  /** Whether field is required */
  required?: boolean;
  /** Email validation */
  email?: boolean;
  /** URL validation */
  url?: boolean;
  /** Date validation */
  date?: boolean;
  /** Numeric validation */
  numeric?: boolean;
  /** File type restrictions */
  fileTypes?: string[];
  /** Maximum file size in bytes */
  maxFileSize?: number;
}

/**
 * Product form data structure
 */
export interface ProductFormData {
  /** Product name */
  name: string;
  /** Product description */
  description: string;
  /** Product price */
  price: string;
  /** Category selection */
  category: string;
  /** Availability status */
  available: boolean;
  /** Product badges */
  badges: ProductBadges;
  /** Brand (for tobacco products) */
  brand?: string;
  /** Product image */
  image?: File | string;
  /** Size variations */
  sizes?: Array<{
    size: string;
    price: string;
  }>;
  /** Translation options */
  translations?: {
    translateName: boolean;
    translateDescription: boolean;
  };
}

/**
 * Product form validation schema
 */
export interface ProductFormValidation {
  name: FieldValidation;
  description: FieldValidation;
  price: FieldValidation;
  category: FieldValidation;
  brand?: FieldValidation;
  image?: FieldValidation;
}

/**
 * Category form data structure
 */
export interface CategoryFormData {
  /** Category name */
  name: string;
  /** Category description */
  description: string;
  /** Category icon */
  icon: string;
  /** Parent page */
  parentPage: string;
  /** Display order */
  order: string;
  /** Visibility status */
  visible: boolean;
  /** Category color */
  color: string;
  /** Background image */
  backgroundImage?: File | string;
}

/**
 * User form data structure
 */
export interface UserFormData {
  /** Username */
  username: string;
  /** Email address */
  email: string;
  /** Full name */
  fullName: string;
  /** User role */
  role: UserRole;
  /** Phone number */
  phoneNumber: string;
  /** Department */
  department: string;
  /** Preferred language */
  preferredLanguage: 'de' | 'da' | 'en';
  /** Account status */
  isActive: boolean;
  /** Password (for new users) */
  password?: string;
  /** Password confirmation */
  confirmPassword?: string;
}

/**
 * Login form data structure
 */
export interface LoginFormData {
  /** Username or email */
  username: string;
  /** Password */
  password: string;
  /** Remember me option */
  rememberMe: boolean;
}

/**
 * Password change form data
 */
export interface PasswordChangeFormData {
  /** Current password */
  currentPassword: string;
  /** New password */
  newPassword: string;
  /** Password confirmation */
  confirmPassword: string;
}

/**
 * Password reset form data
 */
export interface PasswordResetFormData {
  /** Email address */
  email: string;
}

/**
 * Translation form data
 */
export interface TranslationFormData {
  /** German text */
  de: string;
  /** Danish text */
  da: string;
  /** English text */
  en: string;
}

/**
 * Search form data
 */
export interface SearchFormData {
  /** Search query */
  query: string;
  /** Category filter */
  category: string;
  /** Brand filter */
  brand: string;
  /** Availability filter */
  available: 'all' | 'available' | 'unavailable';
  /** Price range */
  priceMin: string;
  priceMax: string;
}

/**
 * Bulk price update form data
 */
export interface BulkPriceUpdateFormData {
  /** New price */
  newPrice: string;
  /** Category to update */
  categoryId: string;
  /** Brand filter */
  brandFilter: string;
  /** Available only filter */
  availableOnly: boolean;
}

/**
 * QR code generation form data
 */
export interface QRCodeFormData {
  /** Table ID */
  tableId: string;
  /** Base URL */
  baseUrl: string;
  /** QR code size */
  size: string;
  /** QR code format */
  format: 'png' | 'svg' | 'jpeg';
}

/**
 * Configuration form data
 */
export interface ConfigFormData {
  /** Site name */
  siteName: string;
  /** Business address */
  address: string;
  /** Phone number */
  phone: string;
  /** Email address */
  email: string;
  /** Business hours */
  hours: Record<string, string>;
  /** Social media links */
  social: Record<string, string>;
  /** WiFi network name */
  wifiNetworkName: string;
  /** WiFi password */
  wifiPassword: string;
}

/**
 * Form submission result
 */
export interface FormSubmissionResult<T = unknown> {
  /** Whether submission was successful */
  success: boolean;
  /** Result data */
  data?: T;
  /** Error message if failed */
  error?: string;
  /** Field-specific errors */
  fieldErrors?: Record<string, string>;
  /** Redirect URL after successful submission */
  redirectUrl?: string;
}

/**
 * Form configuration options
 */
export interface FormConfig {
  /** Form ID */
  id: string;
  /** Form title */
  title: string;
  /** Form description */
  description?: string;
  /** Form fields */
  fields: FormField[];
  /** Submit button text */
  submitText?: string;
  /** Cancel button text */
  cancelText?: string;
  /** Whether to show cancel button */
  showCancel?: boolean;
  /** Whether to validate on blur */
  validateOnBlur?: boolean;
  /** Whether to validate on change */
  validateOnChange?: boolean;
  /** Custom CSS classes */
  className?: string;
  /** Form layout */
  layout?: 'vertical' | 'horizontal' | 'inline';
  /** Column configuration for multi-column forms */
  columns?: number;
}

/**
 * Multi-step form configuration
 */
export interface MultiStepFormConfig {
  /** Form steps */
  steps: Array<{
    /** Step ID */
    id: string;
    /** Step title */
    title: string;
    /** Step description */
    description?: string;
    /** Step fields */
    fields: FormField[];
    /** Whether step is optional */
    optional?: boolean;
  }>;
  /** Current step index */
  currentStep: number;
  /** Whether to show step progress */
  showProgress?: boolean;
  /** Whether to allow going back */
  allowBack?: boolean;
  /** Whether to validate step before proceeding */
  validateStep?: boolean;
}

/**
 * Form hook return type
 */
export interface UseFormReturn<T = Record<string, unknown>> {
  /** Form state */
  formState: FormState<T>;
  /** Function to update form values */
  setValue: (field: keyof T, value: unknown) => void;
  /** Function to set form errors */
  setError: (field: keyof T, error: string) => void;
  /** Function to clear form errors */
  clearError: (field: keyof T) => void;
  /** Function to mark field as touched */
  setTouched: (field: keyof T, touched: boolean) => void;
  /** Function to validate form */
  validate: () => FormValidationResult;
  /** Function to validate specific field */
  validateField: (field: keyof T) => string | null;
  /** Function to reset form */
  reset: () => void;
  /** Function to submit form */
  submit: () => Promise<FormSubmissionResult>;
  /** Function to check if field has error */
  hasError: (field: keyof T) => boolean;
  /** Function to get field error */
  getError: (field: keyof T) => string | undefined;
  /** Function to check if field is touched */
  isTouched: (field: keyof T) => boolean;
}

/**
 * Form validation rules
 */
export interface ValidationRules {
  /** Required field validation */
  required: (message?: string) => FieldValidation;
  /** Email validation */
  email: (message?: string) => FieldValidation;
  /** Minimum length validation */
  minLength: (length: number, message?: string) => FieldValidation;
  /** Maximum length validation */
  maxLength: (length: number, message?: string) => FieldValidation;
  /** Minimum value validation */
  min: (value: number, message?: string) => FieldValidation;
  /** Maximum value validation */
  max: (value: number, message?: string) => FieldValidation;
  /** Pattern validation */
  pattern: (pattern: string | RegExp, message?: string) => FieldValidation;
  /** Custom validation */
  custom: (validator: (value: unknown) => string | null) => FieldValidation;
}

/**
 * Form theme configuration
 */
export interface FormTheme {
  /** Primary color */
  primaryColor: string;
  /** Secondary color */
  secondaryColor: string;
  /** Error color */
  errorColor: string;
  /** Success color */
  successColor: string;
  /** Border radius */
  borderRadius: string;
  /** Font family */
  fontFamily: string;
  /** Input padding */
  inputPadding: string;
  /** Button padding */
  buttonPadding: string;
}
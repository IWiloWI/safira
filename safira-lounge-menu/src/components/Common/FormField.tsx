/**
 * Reusable form field component with integrated validation
 * Provides consistent styling and behavior across all forms
 */

import React, { forwardRef, memo, useRef, useEffect } from 'react';
import styled, { css } from 'styled-components';
import { FaExclamationTriangle, FaCheckCircle, FaSpinner } from 'react-icons/fa';
import { colorUtils, touchUtils } from '../../utils/accessibility';
import useAccessibility from '../../hooks/useAccessibility';

// Base input styles with enhanced accessibility
const baseInputStyles = css<{ 
  hasError?: boolean; 
  isValid?: boolean; 
  shouldShowFocusRing?: boolean;
  reducedMotion?: boolean;
}>`
  width: 100%;
  padding: 12px 16px;
  border: 2px solid ${props => 
    props.hasError ? '#FF6B6B' : 
    props.isValid ? '#4ECDC4' : 
    'rgba(255, 65, 251, 0.3)'
  };
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.3);
  color: rgba(255, 255, 255, 0.9);
  font-size: 1rem;
  font-family: inherit;
  line-height: 1.5;
  transition: ${props => props.reducedMotion ? 'none' : 'all 0.3s ease'};
  backdrop-filter: blur(10px);
  
  /* Ensure minimum touch target size */
  min-height: 44px;

  &:focus {
    outline: none;
    border-color: ${props => 
      props.hasError ? '#FF6B6B' : '#FF41FB'
    };
    ${props => props.shouldShowFocusRing && css`
      box-shadow: 0 0 0 3px ${
        props.hasError ? 'rgba(255, 107, 107, 0.4)' : 'rgba(255, 65, 251, 0.4)'
      };
      outline: 2px solid transparent;
      outline-offset: 2px;
    `}
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    background: rgba(0, 0, 0, 0.2);
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }
  
  /* High contrast mode support */
  @media (prefers-contrast: high) {
    border-width: 3px;
    
    &:focus {
      outline: 3px solid;
      outline-offset: 2px;
    }
  }
  
  /* Reduced motion support */
  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

// Styled components
const FieldContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 20px;
`;

const FieldLabel = styled.label<{ required?: boolean }>`
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 4px;

  ${props => props.required && css`
    &::after {
      content: '*';
      color: #FF6B6B;
      font-weight: bold;
    }
  `}
`;

const InputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const StyledInput = styled.input<{ 
  hasError?: boolean; 
  isValid?: boolean; 
  shouldShowFocusRing?: boolean;
  reducedMotion?: boolean;
}>`
  ${baseInputStyles}
`;

const StyledTextarea = styled.textarea<{ 
  hasError?: boolean; 
  isValid?: boolean; 
  shouldShowFocusRing?: boolean;
  reducedMotion?: boolean;
}>`
  ${baseInputStyles}
  resize: vertical;
  min-height: 100px;
  
  /* Ensure proper line height for readability */
  line-height: 1.6;
`;

const StyledSelect = styled.select<{ 
  hasError?: boolean; 
  isValid?: boolean; 
  shouldShowFocusRing?: boolean;
  reducedMotion?: boolean;
}>`
  ${baseInputStyles}
  cursor: pointer;

  option {
    background: rgba(26, 26, 46, 0.95);
    color: rgba(255, 255, 255, 0.9);
    padding: 8px 12px;
    
    &:hover {
      background: rgba(255, 65, 251, 0.1);
    }

    &:disabled {
      color: rgba(255, 255, 255, 0.4);
      background: rgba(0, 0, 0, 0.2);
    }
  }
`;

const ValidationIcon = styled.div<{ type: 'error' | 'success' | 'loading' }>`
  position: absolute;
  right: 12px;
  display: flex;
  align-items: center;
  color: ${props => {
    switch (props.type) {
      case 'error': return '#FF6B6B';
      case 'success': return '#4ECDC4';
      case 'loading': return '#FF41FB';
      default: return 'rgba(255, 255, 255, 0.6)';
    }
  }};
  font-size: 1rem;
`;

const SpinningIcon = styled(FaSpinner)`
  animation: spin 1s linear infinite;
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

const FieldMessage = styled.div<{ type: 'error' | 'warning' | 'success' | 'help' }>`
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  gap: 6px;
  color: ${props => {
    switch (props.type) {
      case 'error': return '#FF6B6B';
      case 'warning': return '#FFA500';
      case 'success': return '#4ECDC4';
      case 'help': return 'rgba(255, 255, 255, 0.6)';
      default: return 'rgba(255, 255, 255, 0.6)';
    }
  }};
`;

const FieldHelp = styled.div`
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.6);
  font-style: italic;
`;

// Form field props
export interface FormFieldProps {
  // Basic props
  name: string;
  label?: string;
  placeholder?: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search';
  value?: any;
  defaultValue?: any;
  
  // Field behavior
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  autoFocus?: boolean;
  autoComplete?: string;
  
  // Validation
  error?: string;
  errors?: string[];
  warnings?: string[];
  isValid?: boolean;
  isValidating?: boolean;
  
  // Input specific
  min?: number;
  max?: number;
  step?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  
  // Textarea specific
  rows?: number;
  cols?: number;
  
  // Select specific
  options?: Array<{ value: string; label: string; disabled?: boolean }>;
  
  // Help text
  helpText?: string;
  
  // Event handlers
  onChange?: (value: any, event?: React.ChangeEvent) => void;
  onBlur?: (event: React.FocusEvent) => void;
  onFocus?: (event: React.FocusEvent) => void;
  onKeyDown?: (event: React.KeyboardEvent) => void;
  
  // Styling
  className?: string;
  style?: React.CSSProperties;
  
  // Accessibility
  'aria-label'?: string;
  'aria-describedby'?: string;
  'aria-invalid'?: boolean;
  id?: string;
}

/**
 * Main FormField component with enhanced accessibility
 */
const FormField = forwardRef<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement, FormFieldProps>(
  ({
    name,
    label,
    placeholder,
    type = 'text',
    value,
    defaultValue,
    required,
    disabled,
    readOnly,
    autoFocus,
    autoComplete,
    error,
    errors = [],
    warnings = [],
    isValid,
    isValidating,
    min,
    max,
    step,
    minLength,
    maxLength,
    pattern,
    rows,
    cols,
    options,
    helpText,
    onChange,
    onBlur,
    onFocus,
    onKeyDown,
    className,
    style,
    'aria-label': ariaLabel,
    'aria-describedby': ariaDescribedBy,
    'aria-invalid': ariaInvalid,
    id
  }, ref) => {
    
    const { shouldShowFocusRing, isReducedMotion, announce } = useAccessibility();
    const fieldRef = useRef<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(null);
    const hasAnnouncedErrorRef = useRef(false);
    
    // Determine field state
    const hasError = Boolean(error || errors.length > 0);
    const hasWarnings = warnings.length > 0;
    const fieldIsValid = isValid && !hasError && !isValidating;
    
    // Generate IDs for accessibility
    const fieldId = id || `field-${name}`;
    const errorId = `${fieldId}-error`;
    const helpId = `${fieldId}-help`;
    
    // Announce errors to screen readers
    useEffect(() => {
      if (hasError && !hasAnnouncedErrorRef.current) {
        const errorMessage = error || errors[0];
        if (errorMessage) {
          announce(`Error: ${errorMessage}`, 'assertive');
          hasAnnouncedErrorRef.current = true;
        }
      } else if (!hasError) {
        hasAnnouncedErrorRef.current = false;
      }
    }, [hasError, error, errors, announce]);

    // Ensure touch target size compliance
    useEffect(() => {
      const element = fieldRef.current;
      if (element) {
        touchUtils.ensureTouchTarget(element);
      }
    }, []);

    // Handle change events with accessibility enhancements
    const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const target = event.target;
      let fieldValue: any = target.value;
      
      // Type conversion for number inputs
      if (type === 'number' && fieldValue !== '') {
        fieldValue = parseFloat(fieldValue);
        if (isNaN(fieldValue)) fieldValue = undefined;
      }
      
      onChange?.(fieldValue, event);
    };

    // Enhanced focus handler
    const handleFocus = (event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      // Announce field information for screen readers
      if (label || placeholder) {
        const fieldDescription = label || placeholder;
        const requiredText = required ? 'required' : '';
        const typeText = type === 'password' ? 'password field' : '';
        const announcement = [fieldDescription, typeText, requiredText].filter(Boolean).join(', ');
        announce(announcement, 'polite');
      }
      
      onFocus?.(event);
    };

    // Enhanced blur handler
    const handleBlur = (event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      // Announce validation results
      if (hasError) {
        const errorMessage = error || errors[0];
        announce(`Invalid: ${errorMessage}`, 'assertive');
      } else if (fieldIsValid && value) {
        announce('Valid input', 'polite');
      }
      
      onBlur?.(event);
    };
    
    // Common input props with enhanced accessibility
    const commonProps = {
      ref: fieldRef,
      id: fieldId,
      name,
      value: value ?? '',
      defaultValue,
      placeholder,
      required,
      disabled,
      readOnly,
      autoFocus,
      autoComplete,
      hasError,
      isValid: fieldIsValid,
      shouldShowFocusRing,
      reducedMotion: isReducedMotion,
      onChange: handleChange,
      onBlur: handleBlur,
      onFocus: handleFocus,
      onKeyDown,
      'aria-label': ariaLabel || label,
      'aria-describedby': [
        hasError ? errorId : undefined,
        helpText ? helpId : undefined,
        ariaDescribedBy
      ].filter(Boolean).join(' ') || undefined,
      'aria-invalid': ariaInvalid ?? hasError,
      'aria-required': required
    };
    
    // Render appropriate input component
    const renderInput = () => {
      if (options) {
        // Select dropdown
        return (
          <StyledSelect {...commonProps} ref={ref as React.Ref<HTMLSelectElement>}>
            {!required && (
              <option value="">-- Bitte wählen --</option>
            )}
            {options.map(option => (
              <option 
                key={option.value} 
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </StyledSelect>
        );
      }
      
      if (rows !== undefined || cols !== undefined) {
        // Textarea
        return (
          <StyledTextarea
            {...commonProps}
            rows={rows}
            cols={cols}
            minLength={minLength}
            maxLength={maxLength}
            ref={ref as React.Ref<HTMLTextAreaElement>}
          />
        );
      }
      
      // Regular input
      return (
        <StyledInput
          {...commonProps}
          type={type}
          min={min}
          max={max}
          step={step}
          minLength={minLength}
          maxLength={maxLength}
          pattern={pattern}
          ref={ref as React.Ref<HTMLInputElement>}
        />
      );
    };
    
    // Render validation icon
    const renderValidationIcon = () => {
      if (isValidating) {
        return (
          <ValidationIcon type="loading">
            <SpinningIcon />
          </ValidationIcon>
        );
      }
      
      if (hasError) {
        return (
          <ValidationIcon type="error">
            <FaExclamationTriangle />
          </ValidationIcon>
        );
      }
      
      if (fieldIsValid && value) {
        return (
          <ValidationIcon type="success">
            <FaCheckCircle />
          </ValidationIcon>
        );
      }
      
      return null;
    };
    
    return (
      <FieldContainer className={className} style={style}>
        {label && (
          <FieldLabel htmlFor={fieldId} required={required}>
            {label}
          </FieldLabel>
        )}
        
        <InputWrapper>
          {renderInput()}
          {renderValidationIcon()}
        </InputWrapper>
        
        {/* Error messages */}
        {hasError && (
          <FieldMessage type="error" id={errorId} role="alert">
            <FaExclamationTriangle />
            {error || errors[0]}
          </FieldMessage>
        )}
        
        {/* Warning messages */}
        {hasWarnings && !hasError && (
          <FieldMessage type="warning">
            <FaExclamationTriangle />
            {warnings[0]}
          </FieldMessage>
        )}
        
        {/* Help text */}
        {helpText && !hasError && (
          <FieldHelp id={helpId}>
            {helpText}
          </FieldHelp>
        )}
      </FieldContainer>
    );
  }
);

FormField.displayName = 'FormField';

export default memo(FormField);
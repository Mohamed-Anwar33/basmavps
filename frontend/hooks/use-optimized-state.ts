'use client';

import { useState, useCallback, useRef, useMemo } from 'react';
import { useDebouncedCallback } from './use-debounced-state';

interface OptimizedStateOptions<T> {
  debounceDelay?: number;
  onUpdate?: (value: T) => void;
  validator?: (value: T) => boolean;
  serializer?: (value: T) => string;
}

/**
 * Hook for optimized state management with real-time sync capabilities
 * Includes debouncing, validation, and change tracking for performance
 */
export function useOptimizedState<T>(
  initialValue: T,
  options: OptimizedStateOptions<T> = {}
) {
  const {
    debounceDelay = 300,
    onUpdate,
    validator,
    serializer = JSON.stringify
  } = options;

  const [value, setValue] = useState<T>(initialValue);
  const [isUpdating, setIsUpdating] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const initialValueRef = useRef<T>(initialValue);
  const lastSerializedRef = useRef<string>(serializer(initialValue));

  // Debounced update handler
  const debouncedUpdate = useDebouncedCallback(async (newValue: T) => {
    if (!onUpdate) return;

    try {
      setIsUpdating(true);
      setError(null);
      await onUpdate(newValue);
      
      // Update references after successful update
      initialValueRef.current = newValue;
      lastSerializedRef.current = serializer(newValue);
      setHasChanges(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed');
    } finally {
      setIsUpdating(false);
    }
  }, debounceDelay);

  // Optimized setter with validation and change tracking
  const setOptimizedValue = useCallback((newValue: T | ((prev: T) => T)) => {
    setValue(prevValue => {
      const nextValue = typeof newValue === 'function' 
        ? (newValue as (prev: T) => T)(prevValue)
        : newValue;

      // Validate if validator is provided
      if (validator && !validator(nextValue)) {
        setError('Validation failed');
        return prevValue;
      }

      // Check if value actually changed
      const nextSerialized = serializer(nextValue);
      if (nextSerialized === lastSerializedRef.current) {
        return prevValue;
      }

      // Track changes
      const hasActualChanges = nextSerialized !== serializer(initialValueRef.current);
      setHasChanges(hasActualChanges);
      setError(null);

      // Trigger debounced update
      if (hasActualChanges) {
        debouncedUpdate(nextValue);
      }

      return nextValue;
    });
  }, [validator, serializer, debouncedUpdate]);

  // Reset to initial value
  const reset = useCallback(() => {
    setValue(initialValueRef.current);
    setHasChanges(false);
    setError(null);
  }, []);

  // Force immediate update (bypass debouncing)
  const forceUpdate = useCallback(async () => {
    if (!onUpdate || !hasChanges) return;

    try {
      setIsUpdating(true);
      setError(null);
      await onUpdate(value);
      
      initialValueRef.current = value;
      lastSerializedRef.current = serializer(value);
      setHasChanges(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed');
    } finally {
      setIsUpdating(false);
    }
  }, [onUpdate, hasChanges, value, serializer]);

  return {
    value,
    setValue: setOptimizedValue,
    isUpdating,
    hasChanges,
    error,
    reset,
    forceUpdate
  };
}

/**
 * Hook for managing form state with optimized updates
 */
export function useOptimizedForm<T extends Record<string, any>>(
  initialValues: T,
  options: {
    onSubmit?: (values: T) => Promise<void>;
    onUpdate?: (values: T) => void;
    debounceDelay?: number;
    validators?: Partial<Record<keyof T, (value: any) => boolean>>;
  } = {}
) {
  const {
    onSubmit,
    onUpdate,
    debounceDelay = 300,
    validators = {}
  } = options;

  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const initialValuesRef = useRef<T>(initialValues);

  // Debounced update handler
  const debouncedUpdate = useDebouncedCallback((newValues: T) => {
    onUpdate?.(newValues);
  }, debounceDelay);

  // Set field value with validation
  const setFieldValue = useCallback((field: keyof T, value: any) => {
    setValues(prev => {
      const newValues = { ...prev, [field]: value };
      
      // Validate field if validator exists
      const validator = validators[field];
      if (validator && !validator(value)) {
        setErrors(prevErrors => ({
          ...prevErrors,
          [field]: 'Validation failed'
        }));
      } else {
        setErrors(prevErrors => {
          const newErrors = { ...prevErrors };
          delete newErrors[field];
          return newErrors;
        });
      }

      // Check for changes
      const hasActualChanges = JSON.stringify(newValues) !== JSON.stringify(initialValuesRef.current);
      setHasChanges(hasActualChanges);

      // Trigger debounced update
      if (hasActualChanges) {
        debouncedUpdate(newValues);
      }

      return newValues;
    });
  }, [validators, debouncedUpdate]);

  // Submit form
  const handleSubmit = useCallback(async () => {
    if (!onSubmit || isSubmitting) return;

    // Validate all fields
    const fieldErrors: Partial<Record<keyof T, string>> = {};
    let hasValidationErrors = false;

    Object.entries(validators).forEach(([field, validator]) => {
      if (validator && !validator(values[field as keyof T])) {
        fieldErrors[field as keyof T] = 'Validation failed';
        hasValidationErrors = true;
      }
    });

    if (hasValidationErrors) {
      setErrors(fieldErrors);
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit(values);
      
      // Update initial values after successful submit
      initialValuesRef.current = values;
      setHasChanges(false);
    } catch (error) {
    } finally {
      setIsSubmitting(false);
    }
  }, [onSubmit, isSubmitting, validators, values]);

  // Reset form
  const reset = useCallback(() => {
    setValues(initialValuesRef.current);
    setErrors({});
    setHasChanges(false);
  }, []);

  const isValid = useMemo(() => {
    return Object.keys(errors).length === 0;
  }, [errors]);

  return {
    values,
    errors,
    isSubmitting,
    hasChanges,
    isValid,
    setFieldValue,
    handleSubmit,
    reset
  };
}

export default useOptimizedState;
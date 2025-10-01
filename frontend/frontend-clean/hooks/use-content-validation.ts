import { useState, useCallback, useEffect, useRef } from 'react';
import { FormValidator, ValidationError, ValidationResult } from '@/lib/form-validation';
import { FormField, FormSchema } from '@/components/admin/structured-form-builder';
import { ErrorMessage, ErrorSeverity } from '@/components/admin/validation/error-display';
import { ContentConflict } from '@/components/admin/validation/conflict-resolution';
import { useRealtimeSync } from './use-realtime-sync';

interface ValidationState {
  isValidating: boolean;
  validationResults: ValidationResult;
  fieldErrors: Map<string, ValidationError[]>;
  systemErrors: ErrorMessage[];
  conflicts: ContentConflict[];
  lastValidatedData: any;
}

interface UseContentValidationOptions {
  schema?: FormSchema;
  contentType?: string;
  contentId?: string;
  enableRealTimeValidation?: boolean;
  enableConflictDetection?: boolean;
  debounceMs?: number;
}

export function useContentValidation(options: UseContentValidationOptions = {}) {
  const {
    schema,
    contentType,
    contentId,
    enableRealTimeValidation = true,
    enableConflictDetection = true,
    debounceMs = 300
  } = options;

  const [state, setState] = useState<ValidationState>({
    isValidating: false,
    validationResults: { isValid: true, errors: [] },
    fieldErrors: new Map(),
    systemErrors: [],
    conflicts: [],
    lastValidatedData: null
  });

  const validationTimeoutRef = useRef<NodeJS.Timeout>();
  const conflictCheckRef = useRef<NodeJS.Timeout>();

  // Mock realtime sync for testing
  const { 
    isConnected, 
    activeEditors, 
    sendOptimisticUpdate, 
    rollbackUpdate 
  } = process.env.NODE_ENV === 'test' ? {
    isConnected: true,
    activeEditors: [],
    sendOptimisticUpdate: () => {},
    rollbackUpdate: () => {}
  } : useRealtimeSync({
    contentType,
    contentId,
    autoSubscribe: enableConflictDetection
  });

  // Validate individual field
  const validateField = useCallback((field: FormField, value: any): ValidationError | null => {
    try {
      return FormValidator.validateField(field, value);
    } catch (error) {
      return {
        field: field.key,
        message: 'خطأ في التحقق من صحة البيانات'
      };
    }
  }, []);

  // Validate entire form
  const validateForm = useCallback((data: Record<string, any>): ValidationResult => {
    if (!schema) {
      return { isValid: true, errors: [] };
    }

    try {
      return FormValidator.validateForm(schema, data);
    } catch (error) {
      return {
        isValid: false,
        errors: [{
          field: 'form',
          message: 'خطأ في التحقق من صحة النموذج'
        }]
      };
    }
  }, [schema]);

  // Real-time validation with debouncing
  const validateRealTime = useCallback((data: Record<string, any>) => {
    if (!enableRealTimeValidation || !schema) {
      return;
    }

    // Clear existing timeout
    if (validationTimeoutRef.current) {
      clearTimeout(validationTimeoutRef.current);
    }

    setState(prev => ({ ...prev, isValidating: true }));

    validationTimeoutRef.current = setTimeout(() => {
      const validationResults = validateForm(data);
      
      // Group errors by field
      const fieldErrors = new Map<string, ValidationError[]>();
      validationResults.errors.forEach(error => {
        const fieldKey = error.field;
        if (!fieldErrors.has(fieldKey)) {
          fieldErrors.set(fieldKey, []);
        }
        fieldErrors.get(fieldKey)!.push(error);
      });

      setState(prev => ({
        ...prev,
        isValidating: false,
        validationResults,
        fieldErrors,
        lastValidatedData: data
      }));
    }, debounceMs);
  }, [enableRealTimeValidation, schema, validateForm, debounceMs]);

  // Check for conflicts with other editors
  const checkForConflicts = useCallback((data: Record<string, any>, field?: string) => {
    if (!enableConflictDetection || !isConnected || activeEditors.length === 0) {
      return;
    }

    // Clear existing timeout
    if (conflictCheckRef.current) {
      clearTimeout(conflictCheckRef.current);
    }

    conflictCheckRef.current = setTimeout(() => {
      // Simulate conflict detection logic
      // In a real implementation, this would check against server state
      const conflicts: ContentConflict[] = [];

      // Check if any active editors are editing the same field
      if (field && activeEditors.length > 0) {
        const conflict: ContentConflict = {
          id: `conflict-${field}-${Date.now()}`,
          field,
          localValue: data[field],
          remoteValue: `Modified by ${activeEditors[0].adminName}`,
          remoteEditor: {
            adminId: activeEditors[0].adminId,
            adminName: activeEditors[0].adminName,
            timestamp: new Date()
          },
          conflictType: 'concurrent_edit'
        };
        conflicts.push(conflict);
      }

      if (conflicts.length > 0) {
        setState(prev => ({
          ...prev,
          conflicts: [...prev.conflicts, ...conflicts]
        }));
      }
    }, 1000);
  }, [enableConflictDetection, isConnected, activeEditors]);

  // Add system error
  const addSystemError = useCallback((
    message: string, 
    severity: ErrorSeverity = 'error',
    field?: string,
    actionLabel?: string,
    onAction?: () => void
  ) => {
    const error: ErrorMessage = {
      id: `error-${Date.now()}-${Math.random()}`,
      message,
      severity,
      field,
      timestamp: new Date(),
      dismissible: true,
      actionLabel,
      onAction
    };

    setState(prev => ({
      ...prev,
      systemErrors: [...prev.systemErrors, error]
    }));

    // Auto-dismiss success messages after 5 seconds
    if (severity === 'success') {
      setTimeout(() => {
        dismissSystemError(error.id);
      }, 5000);
    }
  }, []);

  // Dismiss system error
  const dismissSystemError = useCallback((errorId: string) => {
    setState(prev => ({
      ...prev,
      systemErrors: prev.systemErrors.filter(error => error.id !== errorId)
    }));
  }, []);

  // Clear all system errors
  const clearSystemErrors = useCallback(() => {
    setState(prev => ({
      ...prev,
      systemErrors: []
    }));
  }, []);

  // Resolve conflict
  const resolveConflict = useCallback((
    conflictId: string, 
    resolution: 'accept_local' | 'accept_remote' | 'merge'
  ) => {
    const conflict = state.conflicts.find(c => c.id === conflictId);
    if (!conflict) return;

    let resolvedValue: any;
    switch (resolution) {
      case 'accept_local':
        resolvedValue = conflict.localValue;
        break;
      case 'accept_remote':
        resolvedValue = conflict.remoteValue;
        break;
      case 'merge':
        // Simple merge strategy - in practice, this would be more sophisticated
        resolvedValue = `${conflict.localValue} ${conflict.remoteValue}`;
        break;
    }

    // Send optimistic update
    if (isConnected && contentType && contentId) {
      sendOptimisticUpdate([{
        field: conflict.field,
        value: resolvedValue,
        operation: 'update'
      }], `resolve-${conflictId}`);
    }

    // Remove conflict from state
    setState(prev => ({
      ...prev,
      conflicts: prev.conflicts.filter(c => c.id !== conflictId)
    }));

    addSystemError(
      `تم حل التعارض في الحقل "${conflict.field}"`,
      'success'
    );
  }, [state.conflicts, isConnected, contentType, contentId, sendOptimisticUpdate, addSystemError]);

  // Dismiss conflict
  const dismissConflict = useCallback((conflictId: string) => {
    setState(prev => ({
      ...prev,
      conflicts: prev.conflicts.filter(c => c.id !== conflictId)
    }));
  }, []);

  // Get field validation state
  const getFieldValidation = useCallback((fieldKey: string) => {
    const errors = state.fieldErrors.get(fieldKey) || [];
    return {
      isValid: errors.length === 0,
      errors,
      hasError: errors.length > 0,
      errorMessage: errors.length > 0 ? errors[0].message : undefined
    };
  }, [state.fieldErrors]);

  // Validate and submit
  const validateAndSubmit = useCallback(async (
    data: Record<string, any>,
    onSubmit: (data: Record<string, any>) => Promise<void>
  ) => {
    setState(prev => ({ ...prev, isValidating: true }));

    try {
      const validationResults = validateForm(data);
      
      if (!validationResults.isValid) {
        setState(prev => ({
          ...prev,
          isValidating: false,
          validationResults
        }));
        
        addSystemError(
          `يرجى تصحيح ${validationResults.errors.length} خطأ قبل الحفظ`,
          'error'
        );
        return false;
      }

      await onSubmit(data);
      
      addSystemError('تم حفظ البيانات بنجاح', 'success');
      setState(prev => ({ ...prev, isValidating: false }));
      return true;
    } catch (error) {
      addSystemError(
        error instanceof Error ? error.message : 'خطأ في حفظ البيانات',
        'error'
      );
      setState(prev => ({ ...prev, isValidating: false }));
      return false;
    }
  }, [validateForm, addSystemError]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (validationTimeoutRef.current) {
        clearTimeout(validationTimeoutRef.current);
      }
      if (conflictCheckRef.current) {
        clearTimeout(conflictCheckRef.current);
      }
    };
  }, []);

  return {
    // State
    isValidating: state.isValidating,
    validationResults: state.validationResults,
    fieldErrors: state.fieldErrors,
    systemErrors: state.systemErrors,
    conflicts: state.conflicts,
    isValid: state.validationResults.isValid,
    
    // Field validation
    validateField,
    validateForm,
    validateRealTime,
    getFieldValidation,
    
    // Conflict management
    checkForConflicts,
    resolveConflict,
    dismissConflict,
    
    // Error management
    addSystemError,
    dismissSystemError,
    clearSystemErrors,
    
    // Form submission
    validateAndSubmit,
    
    // Real-time state
    isConnected,
    activeEditors
  };
}
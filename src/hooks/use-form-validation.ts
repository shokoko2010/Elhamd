'use client'

import { useState, useCallback } from 'react'
import { z } from 'zod'
import { validationUtils } from '@/lib/validation'

interface UseFormValidationOptions<T> {
  schema: z.ZodSchema<T>
  initialValues: T
  onSubmit: (data: T) => Promise<void> | void
  mode?: 'onChange' | 'onBlur' | 'onSubmit'
}

interface UseFormValidationReturn<T> {
  values: T
  errors: Record<string, string>
  isSubmitting: boolean
  touched: Record<string, boolean>
  isValid: boolean
  handleChange: (field: keyof T, value: T[keyof T]) => void
  handleBlur: (field: keyof T) => void
  handleSubmit: (e: React.FormEvent) => Promise<void>
  reset: () => void
  setFieldValue: (field: keyof T, value: T[keyof T]) => void
  setError: (field: keyof T, error: string) => void
  clearErrors: () => void
}

export function useFormValidation<T extends Record<string, any>>({
  schema,
  initialValues,
  onSubmit,
  mode = 'onSubmit'
}: UseFormValidationOptions<T>): UseFormValidationReturn<T> {
  const [values, setValues] = useState<T>(initialValues)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validateField = useCallback((field: keyof T, value: T[keyof T]) => {
    try {
      const fieldSchema = schema.shape[field as string]
      if (fieldSchema) {
        fieldSchema.parse(value)
        return null
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return error.errors[0]?.message
      }
    }
    return null
  }, [schema])

  const validateForm = useCallback((data: T) => {
    const result = validationUtils.validateWithDetails(schema, data)
    if (!result.success) {
      setErrors(result.errors)
      return false
    }
    setErrors({})
    return true
  }, [schema])

  const handleChange = useCallback((field: keyof T, value: T[keyof T]) => {
    setValues(prev => ({ ...prev, [field]: value }))
    
    if (mode === 'onChange') {
      const error = validateField(field, value)
      setErrors(prev => ({ ...prev, [field]: error || '' }))
    }
  }, [mode, validateField])

  const handleBlur = useCallback((field: keyof T) => {
    setTouched(prev => ({ ...prev, [field]: true }))
    
    if (mode === 'onBlur') {
      const error = validateField(field, values[field])
      setErrors(prev => ({ ...prev, [field]: error || '' }))
    }
  }, [mode, validateField, values])

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const isValid = validateForm(values)
      if (isValid) {
        await onSubmit(values)
      }
    } catch (error) {
      console.error('Form submission error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }, [values, validateForm, onSubmit])

  const reset = useCallback(() => {
    setValues(initialValues)
    setErrors({})
    setTouched({})
    setIsSubmitting(false)
  }, [initialValues])

  const setFieldValue = useCallback((field: keyof T, value: T[keyof T]) => {
    setValues(prev => ({ ...prev, [field]: value }))
  }, [])

  const setError = useCallback((field: keyof T, error: string) => {
    setErrors(prev => ({ ...prev, [field]: error }))
  }, [])

  const clearErrors = useCallback(() => {
    setErrors({})
  }, [])

  const isValid = Object.keys(errors).length === 0

  return {
    values,
    errors,
    isSubmitting,
    touched,
    isValid,
    handleChange,
    handleBlur,
    handleSubmit,
    reset,
    setFieldValue,
    setError,
    clearErrors
  }
}
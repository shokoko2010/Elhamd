'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Save, X, Plus, Trash2, Info } from 'lucide-react'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

interface FormField {
  name: string
  label: string
  type: 'text' | 'email' | 'number' | 'tel' | 'password' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'date'
  placeholder?: string
  required?: boolean
  disabled?: boolean
  options?: Array<{ value: string; label: string }>
  description?: string
  defaultValue?: string | number | boolean
  validation?: {
    min?: number
    max?: number
    pattern?: string
    custom?: (value: any) => string | null
  }
  className?: string
  mobilePriority?: 'high' | 'medium' | 'low'
}

interface FormSection {
  title?: string
  description?: string
  fields: FormField[]
  className?: string
}

interface ResponsiveFormProps {
  sections: FormSection[]
  onSubmit: (data: Record<string, any>) => void | Promise<void>
  onCancel?: () => void
  loading?: boolean
  submitText?: string
  cancelText?: string
  className?: string
  initialValues?: Record<string, any>
  showValidationErrors?: boolean
  compact?: boolean
  columns?: {
    default: number
    sm?: number
    md?: number
    lg?: number
  }
}

interface FormState {
  values: Record<string, any>
  errors: Record<string, string>
  touched: Record<string, boolean>
}

export function ResponsiveForm({
  sections,
  onSubmit,
  onCancel,
  loading = false,
  submitText = 'حفظ',
  cancelText = 'إلغاء',
  className,
  initialValues = {},
  showValidationErrors = true,
  compact = false,
  columns = { default: 1, sm: 1, md: 2, lg: 3 }
}: ResponsiveFormProps) {
  const [formState, setFormState] = React.useState<FormState>({
    values: initialValues,
    errors: {},
    touched: {}
  })

  const validateField = (field: FormField, value: any): string | null => {
    if (field.required && (!value || value === '')) {
      return `${field.label} مطلوب`
    }

    if (field.validation) {
      const { min, max, pattern, custom } = field.validation

      if (min !== undefined && value && value.length < min) {
        return `${field.label} يجب أن يكون على الأقل ${min} أحرف`
      }

      if (max !== undefined && value && value.length > max) {
        return `${field.label} يجب أن يكون على الأكثر ${max} أحرف`
      }

      if (pattern && value && !new RegExp(pattern).test(value)) {
        return `${field.label} غير صالح`
      }

      if (custom) {
        return custom(value)
      }
    }

    return null
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}
    let hasErrors = false

    sections.forEach(section => {
      section.fields.forEach(field => {
        const error = validateField(field, formState.values[field.name])
        if (error) {
          newErrors[field.name] = error
          hasErrors = true
        }
      })
    })

    setFormState(prev => ({ ...prev, errors: newErrors }))
    return !hasErrors
  }

  const handleFieldChange = (fieldName: string, value: any) => {
    setFormState(prev => {
      const newValues = { ...prev.values, [fieldName]: value }
      const newTouched = { ...prev.touched, [fieldName]: true }
      const error = sections
        .flatMap(s => s.fields)
        .find(f => f.name === fieldName)
      
      let newErrors = { ...prev.errors }
      if (error && showValidationErrors) {
        const fieldError = validateField(error, value)
        if (fieldError) {
          newErrors[fieldName] = fieldError
        } else {
          delete newErrors[fieldName]
        }
      }

      return {
        values: newValues,
        errors: newErrors,
        touched: newTouched
      }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (validateForm()) {
      try {
        await onSubmit(formState.values)
      } catch (error) {
        console.error('Form submission error:', error)
      }
    }
  }

  const renderField = (field: FormField) => {
    const value = formState.values[field.name] ?? field.defaultValue ?? ''
    const error = formState.errors[field.name]
    const touched = formState.touched[field.name]

    const fieldClasses = cn(
      'w-full',
      field.className,
      error && touched && 'border-red-500 focus:border-red-500',
      field.disabled && 'opacity-50 cursor-not-allowed'
    )

    const commonProps = {
      id: field.name,
      name: field.name,
      value,
      onChange: (e: any) => handleFieldChange(field.name, e.target.value),
      onBlur: () => handleFieldChange(field.name, value),
      disabled: field.disabled,
      placeholder: field.placeholder,
      className: fieldClasses
    }

    const fieldComponent = () => {
      switch (field.type) {
        case 'textarea':
          return (
            <Textarea
              {...commonProps}
              rows={compact ? 2 : 3}
            />
          )

        case 'select':
          return (
            <Select
              value={value?.toString() || ''}
              onValueChange={(v) => handleFieldChange(field.name, v)}
              disabled={field.disabled}
            >
              <SelectTrigger className={fieldClasses}>
                <SelectValue placeholder={field.placeholder || `اختر ${field.label}`} />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )

        case 'checkbox':
          return (
            <div className="flex items-center space-x-2 space-x-reverse">
              <Checkbox
                id={field.name}
                checked={Boolean(value)}
                onCheckedChange={(checked) => handleFieldChange(field.name, checked)}
                disabled={field.disabled}
              />
              <Label htmlFor={field.name} className="text-sm">
                {field.label}
                {field.required && <span className="text-red-500 mr-1">*</span>}
              </Label>
            </div>
          )

        case 'radio':
          return (
            <RadioGroup
              value={value?.toString() || ''}
              onValueChange={(v) => handleFieldChange(field.name, v)}
              disabled={field.disabled}
              className="flex flex-col space-y-1"
            >
              {field.options?.map((option) => (
                <div key={option.value} className="flex items-center space-x-2 space-x-reverse">
                  <RadioGroupItem value={option.value} id={`${field.name}-${option.value}`} />
                  <Label htmlFor={`${field.name}-${option.value}`} className="text-sm">
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          )

        default:
          return (
            <Input
              type={field.type}
              {...commonProps}
            />
          )
      }
    }

    // For checkbox and radio types, the label is part of the component
    if (field.type === 'checkbox' || field.type === 'radio') {
      return (
        <div className={cn(
          field.type === 'checkbox' ? 'col-span-full' : 'col-span-full',
          field.mobilePriority === 'low' && 'hidden sm:block'
        )}>
          {fieldComponent()}
          {field.description && (
            <p className="text-xs text-muted-foreground mt-1">{field.description}</p>
          )}
          {error && touched && showValidationErrors && (
            <p className="text-xs text-red-500 mt-1">{error}</p>
          )}
        </div>
      )
    }

    return (
      <div className={cn(
        'space-y-1',
        field.mobilePriority === 'low' && 'hidden sm:block',
        field.type === 'textarea' && 'col-span-full',
        field.type === 'select' && (columns.default === 1 ? 'col-span-full' : 'col-span-full sm:col-span-2')
      )}>
        <Label htmlFor={field.name} className="text-sm font-medium">
          {field.label}
          {field.required && <span className="text-red-500 mr-1">*</span>}
        </Label>
        {fieldComponent()}
        {field.description && (
          <p className="text-xs text-muted-foreground">{field.description}</p>
        )}
        {error && touched && showValidationErrors && (
          <p className="text-xs text-red-500">{error}</p>
        )}
      </div>
    )
  }

  const getColumnClasses = () => {
    const baseClasses = [
      `grid-cols-${columns.default}`,
      columns.sm && `sm:grid-cols-${columns.sm}`,
      columns.md && `md:grid-cols-${columns.md}`,
      columns.lg && `lg:grid-cols-${columns.lg}`,
    ].filter(Boolean)

    return cn(
      'grid gap-4',
      ...baseClasses
    )
  }

  return (
    <form onSubmit={handleSubmit} className={cn("space-y-6", className)}>
      {sections.map((section, sectionIndex) => (
        <Card key={sectionIndex} className={cn(section.className)}>
          {(section.title || section.description) && (
            <CardHeader className={cn(compact && "pb-3")}>
              {section.title && (
                <CardTitle className={cn(compact && "text-base")}>
                  {section.title}
                </CardTitle>
              )}
              {section.description && (
                <CardDescription className={cn(compact && "text-xs")}>
                  {section.description}
                </CardDescription>
              )}
            </CardHeader>
          )}
          <CardContent className={cn(compact && "pt-0")}>
            <div className={getColumnClasses()}>
              {section.fields.map((field) => renderField(field))}
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Form Actions */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 border-t">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
            className="w-full sm:w-auto order-2 sm:order-1"
          >
            {loading ? (
              <Loader2 className="ml-2 h-4 w-4 animate-spin" />
            ) : (
              <X className="ml-2 h-4 w-4" />
            )}
            {cancelText}
          </Button>
        )}
        <Button
          type="submit"
          disabled={loading}
          className="w-full sm:w-auto order-1 sm:order-2"
        >
          {loading ? (
            <Loader2 className="ml-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="ml-2 h-4 w-4" />
          )}
          {submitText}
        </Button>
      </div>

      {/* Validation Summary */}
      {showValidationErrors && Object.keys(formState.errors).length > 0 && (
        <Alert variant="destructive">
          <Info className="h-4 w-4" />
          <AlertDescription>
            يرجى تصحيح الأخطاء في النموذج قبل الإرسال
          </AlertDescription>
        </Alert>
      )}
    </form>
  )
}

// Mobile-optimized form dialog component
interface FormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  sections: FormSection[]
  onSubmit: (data: Record<string, any>) => void | Promise<void>
  loading?: boolean
  submitText?: string
  cancelText?: string
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
}

export function FormDialog({
  open,
  onOpenChange,
  title,
  description,
  sections,
  onSubmit,
  loading = false,
  submitText = 'حفظ',
  cancelText = 'إلغاء',
  size = 'md'
}: FormDialogProps) {
  const getSizeClasses = () => {
    switch (size) {
      case 'sm': return 'sm:max-w-[425px]'
      case 'lg': return 'sm:max-w-[600px]'
      case 'xl': return 'sm:max-w-[800px]'
      case 'full': return 'sm:max-w-[95vw] sm:max-h-[90vh]'
      default: return 'sm:max-w-[500px]'
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn(
        "max-h-[90vh] overflow-y-auto",
        getSizeClasses(),
        size === 'full' && "p-2 sm:p-6"
      )}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && (
            <DialogDescription>{description}</DialogDescription>
          )}
        </DialogHeader>
        
        <div className={cn(
          "max-h-[60vh] overflow-y-auto",
          size === 'full' && "max-h-[70vh]"
        )}>
          <ResponsiveForm
            sections={sections}
            onSubmit={async (data) => {
              await onSubmit(data)
              onOpenChange(false)
            }}
            onCancel={() => onOpenChange(false)}
            loading={loading}
            submitText={submitText}
            cancelText={cancelText}
            compact={size === 'sm'}
            columns={size === 'sm' ? { default: 1 } : { default: 1, sm: 2, md: 2, lg: 3 }}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
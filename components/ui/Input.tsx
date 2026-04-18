'use client'
import { InputHTMLAttributes, forwardRef } from 'react'
import { clsx } from 'clsx'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-xs font-medium text-text-secondary uppercase tracking-wide">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={clsx(
            'w-full bg-surface border rounded px-3 py-2 text-sm text-text-primary placeholder:text-text-muted transition-colors duration-200',
            'focus:outline-none focus:ring-1 focus:ring-balance/50 focus:border-balance/50',
            error ? 'border-expense' : 'border-border',
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-expense">{error}</p>}
      </div>
    )
  }
)
Input.displayName = 'Input'

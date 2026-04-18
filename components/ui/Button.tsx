'use client'
import { ButtonHTMLAttributes, ReactNode } from 'react'
import { clsx } from 'clsx'
import { Loader2 } from 'lucide-react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  children: ReactNode
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading,
  children,
  className,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={clsx(
        'inline-flex items-center justify-center gap-2 font-sans font-medium transition-all duration-200 rounded focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed',
        {
          'bg-balance text-white hover:bg-balance/90 focus:ring-balance/40': variant === 'primary',
          'bg-surface text-text-primary border border-border hover:bg-background focus:ring-border': variant === 'secondary',
          'text-text-primary hover:bg-background focus:ring-border': variant === 'ghost',
          'bg-expense text-white hover:bg-expense/90 focus:ring-expense/40': variant === 'danger',
        },
        {
          'text-xs px-3 py-1.5': size === 'sm',
          'text-sm px-4 py-2': size === 'md',
          'text-base px-5 py-2.5': size === 'lg',
        },
        className
      )}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </button>
  )
}

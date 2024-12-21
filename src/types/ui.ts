import { ReactNode } from 'react'

export interface BaseProps {
  children?: ReactNode
  className?: string
}

export interface ButtonProps extends BaseProps {
  variant?: 'default' | 'ghost' | 'outline' | 'secondary' | 'destructive' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  asChild?: boolean
  loading?: boolean
}

export interface ToastProps extends BaseProps {
  id: string
  title?: string
  description?: string
  action?: ReactNode
  duration?: number
  variant?: 'default' | 'destructive'
}

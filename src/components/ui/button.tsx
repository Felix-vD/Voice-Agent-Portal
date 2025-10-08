import * as React from 'react'

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'default', size = 'md', ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center whitespace-nowrap rounded-xl font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFC300] focus-visible:ring-offset-2 focus-visible:ring-offset-[#002929] disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed'
    
    const variants = {
      default: 'bg-[#FFC300] text-[#002929] hover:bg-[#ffcd1a] hover:shadow-lg hover:shadow-[#FFC300]/20 hover:scale-[1.02] active:scale-[0.98]',
      outline: 'border-2 border-[#A8F0F0] bg-transparent text-[#A8F0F0] hover:bg-[#A8F0F0]/10 hover:border-[#7dd3d3] active:scale-[0.98]',
      ghost: 'text-[#A8F0F0] hover:bg-[#004444] hover:text-[#ffffff] active:scale-[0.98]',
      danger: 'bg-[#ff4444] text-white hover:bg-[#ff5555] hover:shadow-lg hover:shadow-[#ff4444]/20 hover:scale-[1.02] active:scale-[0.98]',
    }

    const sizes = {
      sm: 'h-9 px-4 text-sm',
      md: 'h-11 px-6 text-base',
      lg: 'h-14 px-8 text-lg',
    }

    return (
      <button
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button }

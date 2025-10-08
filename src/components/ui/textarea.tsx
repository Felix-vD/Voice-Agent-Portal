import * as React from 'react'

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = '', ...props }, ref) => {
    return (
      <textarea
        className={`flex w-full rounded-xl border-2 border-[#004d4d] bg-[#002929] px-4 py-3 text-base text-white placeholder:text-[#7dd3d3]/60 focus:outline-none focus:ring-2 focus:ring-[#FFC300] focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 hover:border-[#006666] resize-none ${className}`}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = 'Textarea'

export { Textarea }


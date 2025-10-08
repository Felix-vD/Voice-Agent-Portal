import * as React from 'react'

export type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement>

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = '', children, ...props }, ref) => {
    return (
      <select
        className={`flex w-full rounded-xl border-2 border-[#004d4d] bg-[#002929] px-4 py-3 text-base text-white focus:outline-none focus:ring-2 focus:ring-[#FFC300] focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 hover:border-[#006666] cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27%23A8F0F0%27 stroke-width=%272%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27%3e%3cpolyline points=%276 9 12 15 18 9%27%3e%3c/polyline%3e%3c/svg%3e')] bg-[length:1.5em] bg-[right_0.5rem_center] bg-no-repeat pr-10 ${className}`}
        ref={ref}
        {...props}
      >
        {children}
      </select>
    )
  }
)
Select.displayName = 'Select'

export { Select }


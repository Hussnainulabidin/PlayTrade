export const Button = ({ children, className = "", variant = "default", ...props }) => {
  const baseStyles = "px-4 py-2 rounded-lg transition-colors duration-200"

  const variants = {
    default: "bg-[#3B6EF2] hover:bg-[#2C5AD9] text-white",
    ghost: "hover:bg-gray-100 dark:hover:bg-gray-800",
    outline: "border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800",
  }

  return (
    <button className={`${baseStyles} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  )
}


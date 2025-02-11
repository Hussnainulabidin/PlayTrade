export const Input = ({ className = "", ...props }) => {
  return (
    <input
      className={`w-full h-11 px-3 rounded-lg bg-[#1f2024] border-0 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3B6EF2] ${className}`}
      {...props}
    />
  )
}


export const Dialog = ({ open, children }) => {
  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="dark:bg-[#18191c] bg-white rounded-lg w-full max-w-[850px] animate-in fade-in duration-200">
        {children}
      </div>
    </div>
  )
}

export const DialogContent = ({ children, className = "" }) => {
  return <div className={`${className}`}>{children}</div>
}


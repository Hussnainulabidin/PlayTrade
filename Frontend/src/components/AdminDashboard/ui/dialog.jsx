"use client"

import React, { createContext, useContext, useEffect, useRef, useState } from "react"
import "../ui.css"
import { cn } from "../../../utils/cn"


const DialogContext = createContext({
  open: false,
  setOpen: () => {}
})

export function Dialog({ children, ...props }) {
  const [open, setOpen] = useState(false)

  return <DialogContext.Provider value={{ open, setOpen }}>{children}</DialogContext.Provider>
}

export function DialogTrigger({ children, asChild = false, ...props }) {
  const { setOpen } = useContext(DialogContext)

  if (asChild) {
    return React.cloneElement(children, {
      onClick: (e) => {
        e.preventDefault()
        setOpen(true)
        if (children.props.onClick) {
          children.props.onClick(e)
        }
      },
      ...props
    })
  }

  return (
    <button type="button" onClick={() => setOpen(true)} {...props}>
      {children}
    </button>
  )
}

export function DialogContent({ children, className, ...props }) {
  const { open, setOpen } = useContext(DialogContext)
  const ref = useRef(null)

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setOpen(false)
      }
    }

    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setOpen(false)
      }
    }

    if (open) {
      document.addEventListener("keydown", handleEscape)
      document.addEventListener("mousedown", handleClickOutside)
      document.body.style.overflow = "hidden"
    }

    return () => {
      document.removeEventListener("keydown", handleEscape)
      document.removeEventListener("mousedown", handleClickOutside)
      document.body.style.overflow = ""
    }
  }, [open, setOpen])

  if (!open) return null

  return (
    <div className="dialog-overlay">
      <div ref={ref} className={`dialog-content ${className || ''}`} {...props}>
        <button className="dialog-close" onClick={() => setOpen(false)}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
        {children}
      </div>
    </div>
  )
}

export function DialogHeader({ className, ...props }) {
  return <div className={`dialog-header ${className || ''}`} {...props} />
}

export function DialogFooter({ className, ...props }) {
  return <div className={`dialog-footer ${className || ''}`} {...props} />
}

export function DialogTitle({ className, ...props }) {
  return <h2 className={`dialog-title ${className || ''}`} {...props} />
}

export function DialogDescription({ className, ...props }) {
  return <p className={`dialog-description ${className || ''}`} {...props} />
}

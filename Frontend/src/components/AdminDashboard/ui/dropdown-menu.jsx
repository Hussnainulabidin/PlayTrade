"use client";

import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "../../../utils/cn";

const DropdownMenuContext = createContext({});

export function DropdownMenu({ children, ...props }) {
  const [open, setOpen] = useState(false);

  return (
    <DropdownMenuContext.Provider value={{ open, setOpen }}>
      <div className="dropdown-menu">{children}</div>
    </DropdownMenuContext.Provider>
  );
}

export function DropdownMenuTrigger({ children, asChild = false, ...props }) {
  const { open, setOpen } = useContext(DropdownMenuContext);

  const Comp = asChild
    ? React.forwardRef(({ className, ...props }, ref) => {
        const Child = React.Children.only(props.children);
        return React.cloneElement(Child, { ref, className: cn(className, Child.props.className), ...props });
      })
    : "button";

  return (
    <Comp
      type={asChild ? undefined : "button"}
      onClick={() => setOpen(!open)}
      aria-expanded={open}
      {...props}
    >
      {children}
    </Comp>
  );
}

export function DropdownMenuContent({ children, className, align = "center", ...props }) {
  const { open, setOpen } = useContext(DropdownMenuContext);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open, setOpen]);

  if (!open) return null;

  return (
    <div ref={ref} className={className} {...props}>
      {children}
    </div>
  );
}

export function DropdownMenuItem({ children, className, onSelect, ...props }) {
  const { setOpen } = useContext(DropdownMenuContext);

  const handleClick = (event) => {
    onSelect?.(event);
    setOpen(false);
  };

  return (
    <button className={className} onClick={handleClick} {...props}>
      {children}
    </button>
  );
}

// New: DropdownMenuPortal
export function DropdownMenuPortal({ children }) {
  const portalRoot = document.body; // Render the dropdown content in the body
  return createPortal(children, portalRoot);
}
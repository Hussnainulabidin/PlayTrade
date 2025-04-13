import React from "react"
import { cn } from "../../../utils/cn"

export function Button({ className, variant = "default", size = "default", asChild = false, ...props }) {
  const Comp = asChild
    ? React.forwardRef(({ className, ...props }, ref) => {
        const Child = React.Children.only(props.children)
        return React.cloneElement(Child, { ref, className: cn(className, Child.props.className), ...props })
      })
    : "button"

  return <Comp className={className} {...props} />
}

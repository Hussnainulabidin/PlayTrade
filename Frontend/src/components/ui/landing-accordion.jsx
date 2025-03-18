"use client"

import React, { createContext, useContext, useState } from "react"
import { cn } from "../../lib/utils"
import { ChevronDown } from "lucide-react"

const AccordionContext = createContext({})

export const Accordion = function Accordion({ children, type = "single", collapsible = false, className, ...props }) {
    const [openItems, setOpenItems] = useState(new Set())

    const toggleItem = (value) => {
        setOpenItems((prevOpenItems) => {
            const newOpenItems = new Set(prevOpenItems)

            if (type === "single") {
                if (collapsible && newOpenItems.has(value)) {
                    newOpenItems.clear()
                } else {
                    newOpenItems.clear()
                    newOpenItems.add(value)
                }
            } else {
                if (newOpenItems.has(value)) {
                    newOpenItems.delete(value)
                } else {
                    newOpenItems.add(value)
                }
            }

            return newOpenItems
        })
    }

    return (
        <AccordionContext.Provider value={{ openItems, toggleItem }}>
            <div className={cn("space-y-1", className)} {...props}>
                {children}
            </div>
        </AccordionContext.Provider>
    )
}

export const AccordionItem = React.forwardRef(function AccordionItem({ className, value, children, ...props }, ref) {
    return (
        <div ref={ref} className={cn("border-b", className)} {...props} data-value={value}>
            {children}
        </div>
    )
})

export const AccordionTrigger = React.forwardRef(function AccordionTrigger({ className, children, ...props }, ref) {
    const { openItems, toggleItem } = useContext(AccordionContext)
    const itemValue = props.value || props["data-value"] || props.parent?.dataset?.value

    return (
        <div
            ref={ref}
            onClick={() => toggleItem(itemValue)}
            className={cn("flex items-center justify-between py-4 font-medium transition-all hover:underline", className)}
            {...props}
        >
            {children}
            <ChevronDown
                className={cn("h-4 w-4 transition-transform duration-200", openItems.has(itemValue) ? "rotate-180" : "")}
            />
        </div>
    )
})

export const AccordionContent = React.forwardRef(function AccordionContent({ className, children, ...props }, ref) {
    const { openItems } = useContext(AccordionContext)
    const itemValue = props.value || props["data-value"] || props.parent?.dataset?.value
    const isOpen = openItems.has(itemValue)

    return (
        <div
            ref={ref}
            className={cn(
                "overflow-hidden text-sm transition-all",
                isOpen ? "animate-accordion-down" : "animate-accordion-up h-0",
                className,
            )}
            {...props}
        >
            <div className="pb-4 pt-0">{children}</div>
        </div>
    )
})


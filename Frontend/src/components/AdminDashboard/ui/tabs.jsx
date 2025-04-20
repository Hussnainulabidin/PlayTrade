"use client"

import { createContext, useContext, useState } from "react"

const TabsContext = createContext({})

export function Tabs({ defaultValue, children, className, ...props }) {
  const [value, setValue] = useState(defaultValue)

  return (
    <TabsContext.Provider value={{ value, setValue }}>
      <div className={className} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  )
}

export function TabsList({ className, ...props }) {
  return <div className={className} {...props} />
}

export function TabsTrigger({ value, className, children, ...props }) {
  const { value: selectedValue, setValue } = useContext(TabsContext)
  const isSelected = selectedValue === value

  return (
    <button
      className={className}
      onClick={() => setValue(value)}
      data-state={isSelected ? "active" : "inactive"}
      {...props}
    >
      {children}
    </button>
  )
}

export function TabsContent({ value, className, children, ...props }) {
  const { value: selectedValue } = useContext(TabsContext)

  if (selectedValue !== value) return null

  return (
    <div className={className} data-state={selectedValue === value ? "active" : "inactive"} {...props}>
      {children}
    </div>
  )
}

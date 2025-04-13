import { PlusCircle } from "lucide-react";
import { Button } from "../ui/button";
import "./Dashboard.css"

export function DashboardHeader({ title }) {
    return (
      <div className="dashboard-header">
        <h1 className="dashboard-title">{title}</h1>
      </div>
    )
  }
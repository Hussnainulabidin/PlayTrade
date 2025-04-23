import { AlertTriangle } from "lucide-react"
import "./ErrorState.css"

const ErrorState = ({ message = "An error occurred" }) => {
    return (
        <div className="error-state">
            <AlertTriangle size={48} className="error-icon" />
            <div className="error-message">{message}</div>
        </div>
    )
}

export default ErrorState

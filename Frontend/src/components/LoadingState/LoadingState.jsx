import "./LoadingState.css"

const LoadingState = ({ message = "Loading..." }) => {
    return (
        <div className="loading-state">
            <div className="loader-spinner"></div>
            <div className="loader-text">{message}</div>
        </div>
    )
}

export default LoadingState

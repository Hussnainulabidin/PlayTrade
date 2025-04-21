import "./GameIcon.css"

const GameIcon = ({ game }) => {
    const getIconClass = (gameName) => {
        switch (gameName) {
            case "PUBG Mobile":
                return "pubg-icon"
            case "Valorant":
                return "valorant-icon"
            case "Clash of Clans":
                return "coc-icon"
            default:
                return "default-icon"
        }
    }

    const getIconContent = (gameName) => {
        switch (gameName) {
            case "PUBG Mobile":
                return "🔫"
            case "Valorant":
                return "🎯"
            case "Clash of Clans":
                return "⚔️"
            default:
                return "🎮"
        }
    }

    return <div className={`game-icon ${getIconClass(game)}`}>{getIconContent(game)}</div>
}

export default GameIcon

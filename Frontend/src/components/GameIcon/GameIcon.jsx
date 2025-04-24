import "./GameIcon.css"
import pubgIcon from './../../../public/images/na.avif'; // Update with your actual image path
import valorantIcon from './../../../public/images/Valo.png'; // Update with your actual image path
import cocIcon from './../../../public/images/coc-icon.png'; // Update with your actual image path

const GameIcon = ({ game }) => {
    const getIconClass = (gameName) => {
        switch (gameName) {
            case "PUBG Mobile":
                return "pubg-icon"
            case "Valorant":
                return "valorant-icon"
            case "Clash of Clans":
                return "coc-icon"
        }
    }

    const getIconImage = (gameName) => {
        switch (gameName) {
            case "PUBG Mobile":
                return pubgIcon;
            case "Valorant":
                return valorantIcon;
            case "Clash of Clans":
                return cocIcon;
        }
    }

    return (
        <div className={`game-icon ${getIconClass(game)}`}>
            <img
                src={getIconImage(game)}
                alt={game}
                className="game-icon-image"
            />
        </div>
    )
}

export default GameIcon